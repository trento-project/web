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
  (`:path` / `:query` / body) via `Trento.AI.OpenApiToolBuilder`.
  Query-tagged args are appended to the request URL, not passed via
  `Plug.Test.conn/3`'s `params_or_body` argument — that argument is a
  single bucket routed by verb (GET → `query_string`, non-GET →
  `body_params`) and cannot carry both query and body simultaneously.
  Appending the query string to the URL is the only mechanism that
  supports a non-GET endpoint with `:in => :query` parameters.
  """

  require Logger

  alias LangChain.Function
  alias Trento.AI.OpenApiToolBuilder
  alias Trento.Users.User
  alias TrentoWeb.AI.McpRouteIndex.Entry

  @doc """
  Build a `%LangChain.Function{}` for the given catalog entry.
  """
  @spec build(Entry.t()) :: Function.t()
  def build(
        %Entry{tool_name: tool_name, display_text: display_text, operation: operation} = entry
      ) do
    Function.new!(%{
      name: tool_name,
      display_text: display_text || tool_name,
      description: OpenApiToolBuilder.description(operation),
      parameters_schema: OpenApiToolBuilder.parameters_schema(operation),
      function: fn args, context -> invoke(entry, args, context) end
    })
  end

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
    {resolved_path, body_args} = resolve_path_and_body(path_template, operation, tool_args)
    dispatch_request(verb, resolved_path, body_args, user_id)
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
    {path_args, query_args, body_args} =
      operation
      |> OpenApiToolBuilder.param_locations()
      |> OpenApiToolBuilder.split_args(tool_args)

    resolved_path =
      path_template
      |> OpenApiToolBuilder.substitute_path(path_args)
      |> OpenApiToolBuilder.append_query(query_args)

    {resolved_path, body_args}
  end

  defp decode_response(%Plug.Conn{status: status, resp_body: body}) when status in 200..299,
    do: {:ok, body_to_string(body)}

  defp decode_response(%Plug.Conn{status: status, resp_body: body}),
    do: {:error, "#{status} #{body_to_string(body)}"}

  defp decode_response(other), do: {:error, "unexpected response #{inspect(other)}"}

  defp body_to_string(nil), do: ""
  defp body_to_string(body) when is_binary(body), do: body
  defp body_to_string(other), do: inspect(other)
end
