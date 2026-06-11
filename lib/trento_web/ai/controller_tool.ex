# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.AI.ControllerTool do
  @moduledoc """
  Translates a `TrentoWeb.AI.McpRouteIndex.Entry` into a
  `%LangChain.Function{}` whose execution dispatches into the controller's
  real action by re-entering `TrentoWeb.Endpoint.call/2`.

  The endpoint runs the full plug stack (Plug.Parsers, Plug.Telemetry,
  `TrentoWeb.Plugs.ActivityLoggingPlug`, Plug.Session, Pow.Plug.Session,
  the router with its `:api` / `:api_v1` / `:protected_api` pipelines, and
  the matched controller's own plugs) — so authorization, activity
  logging, OpenApiSpex param casting, and FallbackController error
  mapping all behave identically to a real HTTP request.

  The only thing we bypass is JWT validation: the channel already
  authenticated the user via the UserSocket. We pre-assign Pow's
  `current_user` on the synthesized conn with the same credentials
  map shape that `TrentoWeb.Plugs.AppJWTAuthPlug.fetch/2` would have
  returned — `%{"user_id" => user_id}` — so `Pow.Plug.Base.call/2`
  short-circuits (current user already present) and the rest of the
  chain runs exactly as for a real HTTP request:
  `TrentoWeb.Plugs.LoadUserPlug` (where wired by the controller)
  hydrates the credentials map into a `%Trento.Users.User{}`, then
  `Bodyguard.Plug.Authorize` / `OperationsPolicyPlug` authorise
  against the loaded user. ControllerTool itself owns no auth logic.

  Args are routed by the operation's declared `:in` field
  (`:path` / `:query` / body) via `param_locations/1` + `split_args/2`.
  Query-tagged args are appended to the request URL, not passed via
  `Plug.Test.conn/3`'s `params_or_body` argument — that argument is a
  single bucket routed by verb (GET → `query_string`, non-GET →
  `body_params`) and cannot carry both query and body simultaneously.
  Appending the query string to the URL is the only mechanism that
  supports a non-GET endpoint with `:in => :query` parameters. The
  current Trento MCP catalog is GET-only for query-tagged parameters,
  but the routing supports any verb per the OpenAPI 3.x spec
  (`PathItem` allows query parameters on any operation method).
  """

  require Logger

  alias LangChain.Function
  alias OpenApiSpex.{OpenApi, Operation, Parameter, RequestBody}
  alias Trento.Users.User
  alias TrentoWeb.AI.McpRouteIndex.Entry

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

  # Builds a JSON-Schema map from operation parameters + requestBody.
  # String-keyed throughout to match LangChain convention.
  # `"required"` is omitted when empty.
  defp parameters_schema(%Operation{parameters: parameters} = operation)
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

  defp parameters_schema(_), do: %{"type" => "object", "properties" => %{}}

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

  defp put_if(map, _key, value) when value in [nil, "", []], do: map
  defp put_if(map, key, value), do: Map.put(map, key, value)

  # OpenApiSpex lets controllers reference reusable schemas by module
  # name (e.g. `request_body: {..., "application/json", UserCreationRequest}`).
  # The raw struct then carries the module atom rather than the
  # `%Schema{}` it generates. `OpenApi.to_map/1` on a bare atom would
  # stringify it; resolve to the real schema first via the module's
  # generated `schema/0` function.
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

  defp invoke(
         %Entry{
           operation: operation,
           controller: controller,
           action: action,
           verb: verb,
           path: path_template
         },
         tool_args,
         %{scope: %User{id: user_id}} = _context
       ) do
    path_template
    |> resolve_path_and_body(operation, tool_args)
    |> then(fn {resolved_path, body_args} ->
      dispatch_request(verb, resolved_path, body_args, user_id)
    end)
  rescue
    exception ->
      Logger.error(
        "AI tool #{inspect(controller)}.#{action} crashed: " <>
          Exception.format(:error, exception, __STACKTRACE__)
      )

      {:error, "tool invocation failed (#{Exception.message(exception)})"}
  end

  defp dispatch_request(verb, resolved_path, body_args, user_id) do
    body_value = encode_request_body(verb, body_args)

    verb
    |> Plug.Test.conn(resolved_path, body_value)
    |> Plug.Conn.put_req_header("accept", "application/json")
    |> maybe_put_json_content_type(body_value)
    |> Pow.Plug.put_config(otp_app: :trento)
    |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, otp_app: :trento)
    |> TrentoWeb.Endpoint.call([])
    |> decode_response()
  end

  # For non-GET verbs with body params, encode to JSON so the synthesised
  # conn carries `application/json` content-type matching the operation's
  # requestBody declaration. CastAndValidate enforces this match — leaving
  # body_args as a map would have Plug.Test set `multipart/mixed` and 422.
  # For GET (and empty body), keep map / nil so Plug.Test merges into the
  # query string as today.
  defp encode_request_body(verb, body_args)
       when verb in [:get, :head] or map_size(body_args) == 0,
       do: body_args_or_nil(body_args)

  defp encode_request_body(_verb, body_args), do: Jason.encode!(body_args)

  defp body_args_or_nil(body_args) when map_size(body_args) == 0, do: nil
  defp body_args_or_nil(body_args), do: body_args

  defp maybe_put_json_content_type(conn, body) when is_binary(body) do
    Plug.Conn.put_req_header(conn, "content-type", "application/json")
  end

  defp maybe_put_json_content_type(conn, _), do: conn

  defp resolve_path_and_body(path_template, operation, tool_args) do
    operation
    |> param_locations()
    |> split_args(tool_args)
    |> then(fn {path_args, query_args, body_args} ->
      resolved_path =
        path_template
        |> substitute_path(path_args)
        |> append_query(query_args)

      {resolved_path, body_args}
    end)
  end

  defp param_locations(%Operation{parameters: params}) when is_list(params) do
    Map.new(params, fn %Parameter{name: name, in: location} ->
      {to_string(name), location}
    end)
  end

  defp param_locations(_), do: %{}

  defp split_args(locations, tool_args) do
    Enum.reduce(tool_args, {%{}, %{}, %{}}, fn {k, v}, {path_map, query_map, body_map} ->
      key = to_string(k)

      case Map.get(locations, key) do
        :path -> {Map.put(path_map, key, v), query_map, body_map}
        :query -> {path_map, Map.put(query_map, key, v), body_map}
        _ -> {path_map, query_map, Map.put(body_map, key, v)}
      end
    end)
  end

  defp substitute_path(path_template, path_args) do
    Enum.reduce(path_args, path_template, fn {name, value}, acc ->
      String.replace(acc, ":#{name}", URI.encode_www_form(to_string(value || "")))
    end)
  end

  defp append_query(path, query) when map_size(query) == 0, do: path

  defp append_query(path, query) do
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

  defp decode_response(%Plug.Conn{status: status, resp_body: body}) when status in 200..299,
    do: {:ok, body_to_string(body)}

  defp decode_response(%Plug.Conn{status: status, resp_body: body}),
    do: {:error, "#{status} #{body_to_string(body)}"}

  defp decode_response(other), do: {:error, "unexpected response #{inspect(other)}"}

  defp body_to_string(nil), do: ""
  defp body_to_string(body) when is_binary(body), do: body
  defp body_to_string(other), do: inspect(other)
end
