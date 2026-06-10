# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.RemoteHttpTool do
  @moduledoc """
  Translates a `Trento.AI.OperationEntry` into a `%LangChain.Function{}`
  whose execution dispatches an authenticated HTTP request against a
  remote service described by its OpenAPI document.

  This is the remote counterpart of `TrentoWeb.AI.ControllerTool`. Both
  share `Trento.AI.OpenApiToolBuilder` for the transport-independent
  pieces (description, parameters_schema, arg routing, path templating,
  query encoding). Only the actual dispatch differs — `ControllerTool`
  re-enters `TrentoWeb.Endpoint.call/2` via `Plug.Test`; this module
  performs an outbound HTTP request via `HTTPoison`.

  The JWT used to authenticate the websocket conversation is forwarded
  to the remote service as an `Authorization: Bearer <token>` header.
  Remote services that share an introspection endpoint with trento web
  (e.g. wanda's `WandaWeb.Auth.AuthPlug`) authenticate the request as
  the same user.

  Arguments are routed by the operation's declared `:in` field
  (`:path` / `:query` / body). Body args for non-GET verbs are
  JSON-encoded and sent with `Content-Type: application/json`. GET
  bodies are dropped — query args end up in the URL via
  `OpenApiToolBuilder.append_query/2`.

  Return convention mirrors `ControllerTool` so LangChain marks
  `ToolResult.is_error` correctly:

  - `{:ok, body_string}` for 2xx responses
  - `{:error, "<status> <body>"}` for non-2xx responses
  - `{:error, "tool invocation failed (<reason>)"}` for transport-level
    failures or unexpected closure crashes
  """

  require Logger

  alias LangChain.Function

  alias Trento.AI.ApplicationConfigLoader
  alias Trento.AI.{OpenApiToolBuilder, OperationEntry}

  @default_recv_timeout 30_000

  @doc """
  Build a `%LangChain.Function{}` for the given entry. `base_url` is
  the dispatch base supplied by the source (typically
  `spec.servers[0].url`). When `base_url` carries an http/https scheme
  it's used verbatim; otherwise the websocket request origin forwarded
  through `tool_context.request_origin` is prepended at request time.
  """
  @spec build(OperationEntry.t(), String.t()) :: Function.t()
  def build(
        %OperationEntry{tool_name: tool_name, display_text: display_text, operation: operation} =
          entry,
        base_url
      )
      when is_binary(base_url) do
    Function.new!(%{
      name: tool_name,
      display_text: display_text || tool_name,
      description: OpenApiToolBuilder.description(operation),
      parameters_schema: OpenApiToolBuilder.parameters_schema(operation),
      function: fn args, context -> invoke(entry, base_url, args, context) end
    })
  end

  defp invoke(
         %OperationEntry{operation: operation, verb: verb, path: path_template} = entry,
         base_url,
         tool_args,
         context
       ) do
    with {:ok, jwt} <- fetch_access_token(context) do
      {resolved_path, body_args} = resolve_path_and_body(path_template, operation, tool_args)
      origin = fetch_request_origin(context)
      dispatch_request(verb, base_url, resolved_path, body_args, jwt, origin)
    end
  rescue
    exception ->
      Logger.error(
        "Remote AI tool #{entry.tool_name} crashed: " <>
          Exception.format(:error, exception, __STACKTRACE__)
      )

      {:error, "tool invocation failed (#{Exception.message(exception)})"}
  end

  defp fetch_access_token(%{tool_context: %{access_token: token}})
       when is_binary(token) and token != "",
       do: {:ok, token}

  defp fetch_access_token(_context),
    do: {:error, "tool invocation failed (missing access_token in tool context)"}

  defp fetch_request_origin(%{tool_context: %{request_origin: origin}}), do: origin
  defp fetch_request_origin(_), do: nil

  defp dispatch_request(verb, base_url, resolved_path, body_args, jwt, request_origin) do
    url = resolve_url(base_url, resolved_path, request_origin)
    body = encode_body(verb, body_args)
    headers = build_headers(jwt, body)
    options = [recv_timeout: @default_recv_timeout]

    verb
    |> http_client().request(url, body, headers, options)
    |> decode_response()
  end

  defp resolve_url(base_url, path, origin) do
    case URI.parse(base_url) do
      %URI{scheme: scheme} when scheme in ["http", "https"] ->
        base_url <> path

      _ when is_binary(origin) and origin != "" ->
        origin <> base_url <> path

      _ ->
        base_url <> path
    end
  end

  defp encode_body(verb, body_args)
       when verb in [:get, :head] or map_size(body_args) == 0,
       do: ""

  defp encode_body(_verb, body_args), do: Jason.encode!(body_args)

  defp build_headers(jwt, body) do
    base = [
      {"authorization", "Bearer #{jwt}"},
      {"accept", "application/json"}
    ]

    if body != "" do
      [{"content-type", "application/json"} | base]
    else
      base
    end
  end

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

  defp decode_response({:ok, %HTTPoison.Response{status_code: status, body: body}})
       when status in 200..299,
       do: {:ok, body_to_string(body)}

  defp decode_response({:ok, %HTTPoison.Response{status_code: status, body: body}}),
    do: {:error, "#{status} #{body_to_string(body)}"}

  defp decode_response({:error, %HTTPoison.Error{reason: reason}}),
    do: {:error, "tool invocation failed (#{inspect(reason)})"}

  defp decode_response(other),
    do: {:error, "tool invocation failed (unexpected response #{inspect(other)})"}

  defp body_to_string(nil), do: ""
  defp body_to_string(body) when is_binary(body), do: body
  defp body_to_string(other), do: inspect(other)

  defp http_client,
    do: Keyword.fetch!(ApplicationConfigLoader.load(), :http_client)
end
