# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.OpenApiToolBuilder do
  @moduledoc """
  Transport-agnostic helpers shared by every `Trento.AI.ToolSource` that
  derives `LangChain.Function`s from `%OpenApiSpex.Operation{}` structs.

  Two distinct concerns live here:

  1. **Schema synthesis** — `description/1` and `parameters_schema/1`
     produce the metadata `LangChain.Function.new!/1` consumes. The
     resulting `parameters_schema` is the JSON-Schema map a provider
     adapter (Anthropic, Google AI, OpenAI) eventually forwards to the
     model.

  2. **Arg routing** — `param_locations/1`, `split_args/2`,
     `substitute_path/2`, `append_query/2` turn the LLM-supplied
     argument map into a `{path, body}` pair, respecting each parameter's
     declared `in:` location.

  Both `TrentoWeb.AI.ControllerTool` (local Plug.Test dispatch) and
  `Trento.AI.RemoteHttpTool` (remote HTTP dispatch) consume these helpers,
  so the OpenAPI surface drives both transports identically. The only
  thing that differs is how the resolved request is actually executed.
  """

  alias OpenApiSpex.{OpenApi, Operation, Parameter, RequestBody}

  @doc """
  Concatenates `summary` + `description` of an `%Operation{}` into the
  human-readable tool description shown to the LLM.
  """
  @spec description(Operation.t() | nil) :: String.t()
  def description(%Operation{summary: summary, description: description}) do
    [summary, description]
    |> Enum.reject(&(is_nil(&1) or &1 == ""))
    |> Enum.join("\n\n")
  end

  def description(_), do: ""

  @doc """
  JSON-Schema map for `LangChain.Function.new!/1`'s `:parameters_schema`.

  String-keyed throughout to match LangChain convention and the
  `Map.put_new(schema, "additionalProperties", false)` behaviour of
  `ChatAnthropic.get_parameters/1`. The `"required"` key is omitted when
  empty so parameterless tools pass `ChatGoogleAI.for_api/1`'s exact-match
  deletion check.
  """
  @spec parameters_schema(Operation.t() | any()) :: map()
  def parameters_schema(%Operation{parameters: parameters} = operation)
      when is_list(parameters) do
    parameters
    |> Enum.reduce({%{}, []}, &accumulate_parameter/2)
    |> then(fn {params_schemas, params_required} ->
      operation
      |> request_body_props()
      |> then(fn {body_props, body_required} ->
        %{}
        |> Map.put("type", "object")
        |> Map.put("properties", Map.merge(params_schemas, body_props))
        |> put_if("required", Enum.uniq(params_required ++ body_required))
      end)
    end)
  end

  def parameters_schema(_), do: %{"type" => "object", "properties" => %{}}

  @doc """
  Map of parameter name (string) → declared `:in` location
  (`:path | :query | :body | :header`) for an `%Operation{}`.
  """
  @spec param_locations(Operation.t() | any()) :: %{String.t() => atom()}
  def param_locations(%Operation{parameters: params}) when is_list(params) do
    Map.new(params, fn %Parameter{name: name, in: location} ->
      {to_string(name), location}
    end)
  end

  def param_locations(_), do: %{}

  @doc """
  Splits the LLM-supplied `tool_args` map into `{path, query, body}`
  according to each key's declared `:in` location. Unknown keys land in
  the body bucket.
  """
  @spec split_args(%{String.t() => atom()}, map()) :: {map(), map(), map()}
  def split_args(locations, tool_args) do
    Enum.reduce(tool_args, {%{}, %{}, %{}}, fn {k, v}, {path_map, query_map, body_map} ->
      key = to_string(k)

      case Map.get(locations, key) do
        :path -> {Map.put(path_map, key, v), query_map, body_map}
        :query -> {path_map, Map.put(query_map, key, v), body_map}
        _ -> {path_map, query_map, Map.put(body_map, key, v)}
      end
    end)
  end

  @doc """
  Substitutes `:placeholder` (Phoenix-style) and `{placeholder}`
  (OpenAPI-style) segments in the path template with URI-encoded values
  from `path_args`.

  Phoenix routes carry `:id`-style templates; OpenAPI specs carry
  `{id}`-style templates. Supporting both lets the same helper drive both
  local controller routes and remote OpenAPI-described endpoints.
  """
  @spec substitute_path(String.t(), map()) :: String.t()
  def substitute_path(path_template, path_args) do
    Enum.reduce(path_args, path_template, fn {name, value}, acc ->
      encoded = URI.encode_www_form(to_string(value || ""))

      acc
      |> String.replace(":#{name}", encoded)
      |> String.replace("{#{name}}", encoded)
    end)
  end

  @doc """
  Appends a `?k=v&...` query string to `path`. Array values explode into
  repeated keys, matching OpenAPI 3 `style: form, explode: true`.
  """
  @spec append_query(String.t(), map()) :: String.t()
  def append_query(path, query) when map_size(query) == 0, do: path

  def append_query(path, query) do
    query_string =
      query
      |> Enum.flat_map(&expand_query_pair/1)
      |> URI.encode_query()

    "#{path}?#{query_string}"
  end

  defp expand_query_pair({key, values}) when is_list(values),
    do: Enum.map(values, &{to_string(key), to_string(&1)})

  defp expand_query_pair({key, value}),
    do: [{to_string(key), to_string(value)}]

  defp accumulate_parameter(
         %Parameter{
           name: name,
           required: required,
           schema: schema,
           description: description,
           example: example
         },
         {accumulated_props, accumulated_required_props}
       ) do
    schema
    |> resolve_schema()
    |> OpenApi.to_map()
    |> put_if("description", description)
    |> put_if("example", example)
    |> then(fn property_schema ->
      key = to_string(name)

      {
        Map.put(accumulated_props, key, property_schema),
        maybe_add_required_prop(accumulated_required_props, {key, required})
      }
    end)
  end

  defp accumulate_parameter(_, acc), do: acc

  defp maybe_add_required_prop(required_so_far, {possibly_required_key, true = _required?}),
    do: [possibly_required_key | required_so_far]

  defp maybe_add_required_prop(required_so_far, _), do: required_so_far

  # OpenApiSpex allows schemas to be referenced by module name; resolve
  # those to the real `%Schema{}` so `OpenApi.to_map/1` walks something
  # meaningful instead of stringifying the atom.
  defp resolve_schema(%OpenApiSpex.Schema{} = schema), do: schema

  defp resolve_schema(module) when is_atom(module) and not is_nil(module) do
    if Code.ensure_loaded?(module) and function_exported?(module, :schema, 0) do
      module.schema()
    else
      %OpenApiSpex.Schema{}
    end
  end

  defp resolve_schema(_), do: %OpenApiSpex.Schema{}

  defp request_body_props(%Operation{
         requestBody: %RequestBody{content: content}
       })
       when is_map(content) do
    case Map.get(content, "application/json") do
      %{schema: schema} ->
        schema
        |> resolve_schema()
        |> OpenApi.to_map()
        |> then(&{Map.get(&1, "properties", %{}), Map.get(&1, "required", [])})

      _ ->
        {%{}, []}
    end
  end

  defp request_body_props(_), do: {%{}, []}

  defp put_if(map, _key, value) when value in [nil, "", []], do: map
  defp put_if(map, key, value), do: Map.put(map, key, value)
end
