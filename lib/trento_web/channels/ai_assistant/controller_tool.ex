# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.AIAssistant.ControllerTool do
  @moduledoc """
  Translates a `TrentoWeb.AIAssistant.ToolCatalog.Entry` into a
  `%LangChain.Function{}` whose execution dispatches into the controller's
  real action by re-entering `TrentoWeb.Endpoint.call/2`.

  The endpoint runs the full plug stack (Plug.Parsers, Plug.Telemetry,
  `TrentoWeb.Plugs.ActivityLoggingPlug`, Plug.Session, Pow.Plug.Session,
  the router with its `:api` / `:api_v1` / `:protected_api` pipelines, and
  the matched controller's own plugs) — so authorization, activity
  logging, OpenApiSpex param casting, and FallbackController error
  mapping all behave identically to a real HTTP request.

  The only thing we bypass is JWT validation: the channel already
  authenticated the user via the UserSocket, so we pre-assign
  `current_user` on the synthesized conn. `Pow.Plug.Base.call/2`
  short-circuits its `do_fetch` when a current user is already present,
  so `TrentoWeb.Plugs.AppJWTAuthPlug` becomes a no-op for in-process
  invocations.
  """

  require Logger

  alias LangChain.Function
  alias OpenApiSpex.{Operation, Parameter, RequestBody}
  alias Trento.Users
  alias TrentoWeb.AIAssistant.ToolCatalog.Entry

  @doc """
  Build a `%LangChain.Function{}` for the given catalog entry.
  """
  @spec build(Entry.t()) :: Function.t()
  def build(%Entry{operation: operation} = entry) do
    Function.new!(%{
      name: entry.tool_name,
      display_text: entry.display_text || entry.tool_name,
      description: description(operation),
      parameters_schema: parameters_schema(operation),
      function: fn args, context -> invoke(entry, args, context) end
    })
  end

  defp description(%Operation{summary: summary, description: description}) do
    [summary, description]
    |> Enum.reject(&(is_nil(&1) or &1 == ""))
    |> Enum.join("\n\n")
  end

  defp description(_), do: ""

  # Builds a JSON-Schema-ish map from operation parameters + requestBody.
  defp parameters_schema(%Operation{} = operation) do
    {params_props, params_required} =
      operation
      |> Map.get(:parameters, [])
      |> List.wrap()
      |> Enum.reduce({%{}, []}, &accumulate_parameter/2)

    {body_props, body_required} = request_body_props(operation)

    %{
      type: "object",
      properties: Map.merge(params_props, body_props),
      required: Enum.uniq(params_required ++ body_required)
    }
  end

  defp parameters_schema(_), do: %{type: "object", properties: %{}, required: []}

  defp accumulate_parameter(
         %Parameter{name: name, required: required, schema: schema} = param,
         {props, req}
       ) do
    description = Map.get(param, :description)
    json_schema = schema_to_json(schema, description)
    key = to_string(name)
    props = Map.put(props, key, json_schema)
    req = if required, do: [key | req], else: req
    {props, req}
  end

  defp accumulate_parameter(_, acc), do: acc

  defp request_body_props(%Operation{
         requestBody: %RequestBody{content: content, required: required}
       })
       when is_map(content) do
    json_schema =
      content
      |> Map.get("application/json")
      |> case do
        %{schema: schema} -> schema_to_json(schema, nil)
        _ -> nil
      end

    case json_schema do
      %{properties: properties} when is_map(properties) ->
        body_required = Enum.map(json_schema[:required] || [], &to_string/1)

        properties_str = Map.new(properties, fn {k, v} -> {to_string(k), v} end)

        body_required = if required, do: Map.keys(properties_str), else: body_required
        {properties_str, body_required}

      _ ->
        {%{}, []}
    end
  end

  defp request_body_props(_), do: {%{}, []}

  # Schema translation: support primitive types + arrays + nested objects. Anything
  # exotic (refs, allOf/oneOf) falls back to an untyped `%{}`.
  defp schema_to_json(
         %OpenApiSpex.Schema{type: :object, properties: props, required: req} = schema,
         description
       ) do
    json_props = Map.new(props || %{}, fn {k, v} -> {to_string(k), schema_to_json(v, nil)} end)

    base = %{
      type: "object",
      properties: json_props,
      required: Enum.map(req || [], &to_string/1)
    }

    base
    |> put_if(:description, description || schema.description)
    |> put_if(:example, schema.example)
  end

  defp schema_to_json(%OpenApiSpex.Schema{type: :array, items: items} = schema, description) do
    %{type: "array", items: schema_to_json(items, nil)}
    |> put_if(:description, description || schema.description)
    |> put_if(:example, schema.example)
  end

  defp schema_to_json(%OpenApiSpex.Schema{type: type} = schema, description)
       when not is_nil(type) do
    %{type: to_string(type)}
    |> put_if(:format, schema.format)
    |> put_if(:description, description || schema.description)
    |> put_if(:example, schema.example)
    |> put_if(:enum, schema.enum)
  end

  defp schema_to_json(_, description), do: put_if(%{}, :description, description)

  defp put_if(map, _key, nil), do: map
  defp put_if(map, _key, ""), do: map
  defp put_if(map, _key, []), do: map
  defp put_if(map, key, value), do: Map.put(map, key, value)

  @doc """
  Executes the controller action for a catalog entry against a synthesized
  conn. Returns a string (success body or error string) suitable as a
  LangChain.Function result.
  """
  @spec invoke(Entry.t(), map(), map()) :: String.t()
  def invoke(%Entry{} = entry, args, %{scope: %{id: user_id}}) do
    case Users.get_user(user_id) do
      {:ok, user} -> dispatch(entry, args || %{}, user)
      _ -> "unauthorized"
    end
  end

  def invoke(_, _, _), do: "unauthorized"

  defp dispatch(%Entry{verb: verb, path: path_template} = entry, args, user) do
    {path, body} = render_request(verb, path_template, args)

    verb
    |> Plug.Test.conn(path, body)
    |> Plug.Conn.put_req_header("accept", "application/json")
    |> maybe_put_content_type(body)
    |> Pow.Plug.put_config(otp_app: :trento)
    |> Pow.Plug.assign_current_user(user, otp_app: :trento)
    |> TrentoWeb.Endpoint.call([])
    |> decode_response()
  rescue
    exception ->
      Logger.error(
        "AI tool #{inspect(entry.controller)}.#{entry.action} crashed: " <>
          Exception.format(:error, exception, __STACKTRACE__)
      )

      "error: tool invocation failed (#{Exception.message(exception)})"
  end

  defp maybe_put_content_type(conn, body) when is_binary(body) and byte_size(body) > 0 do
    Plug.Conn.put_req_header(conn, "content-type", "application/json")
  end

  defp maybe_put_content_type(conn, _), do: conn

  # Splits args into path/query/body and renders the final request line.
  defp render_request(verb, path_template, args) do
    {path_params, rest} = extract_path_params(path_template, args)
    rendered_path = render_path(path_template, path_params)

    cond do
      verb in [:get, :delete] ->
        query = encode_query(rest)
        path_with_query = if query == "", do: rendered_path, else: "#{rendered_path}?#{query}"
        {path_with_query, nil}

      map_size(rest) == 0 ->
        {rendered_path, nil}

      true ->
        {rendered_path, Jason.encode!(rest)}
    end
  end

  defp extract_path_params(path_template, args) do
    placeholders =
      ~r/:([a-zA-Z_][a-zA-Z0-9_]*)/
      |> Regex.scan(path_template)
      |> Enum.map(fn [_, name] -> name end)

    Enum.reduce(placeholders, {%{}, args}, fn name, {path_acc, rest} ->
      {value, rest_after} = pop_arg(rest, name)
      {Map.put(path_acc, name, value), rest_after}
    end)
  end

  defp pop_arg(args, name) do
    cond do
      Map.has_key?(args, name) -> Map.pop(args, name)
      Map.has_key?(args, String.to_atom(name)) -> Map.pop(args, String.to_atom(name))
      true -> {nil, args}
    end
  end

  defp render_path(path_template, path_params) do
    Enum.reduce(path_params, path_template, fn {name, value}, acc ->
      String.replace(acc, ":#{name}", URI.encode_www_form(to_string(value || "")))
    end)
  end

  defp encode_query(map) when map_size(map) == 0, do: ""

  defp encode_query(map) do
    map
    |> Enum.map(fn {k, v} -> {to_string(k), to_query_value(v)} end)
    |> URI.encode_query()
  end

  defp to_query_value(v) when is_binary(v), do: v
  defp to_query_value(v) when is_atom(v), do: Atom.to_string(v)
  defp to_query_value(v) when is_number(v), do: to_string(v)
  defp to_query_value(v), do: Jason.encode!(v)

  defp decode_response(%Plug.Conn{status: status, resp_body: body}) when status in 200..299 do
    case body do
      nil -> ~s({"status":"ok"})
      "" -> ~s({"status":"#{status}"})
      str when is_binary(str) -> str
      other -> inspect(other)
    end
  end

  defp decode_response(%Plug.Conn{status: status, resp_body: body}) do
    body_str =
      case body do
        nil -> ""
        str when is_binary(str) -> str
        other -> inspect(other)
      end

    "error: #{status} #{body_str}"
  end

  defp decode_response(other) do
    "error: unexpected response #{inspect(other)}"
  end
end
