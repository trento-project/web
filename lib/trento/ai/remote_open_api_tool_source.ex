# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.RemoteOpenApiToolSource do
  @moduledoc """
  `Trento.AI.ToolSource` implementation that derives AI assistant tools
  from a remote service's OpenAPI document.

  At `tools/1` time:

  1. Fetch the spec from `:spec_url` (HTTP GET, JSON response).
  2. Decode via `OpenApiSpex.OpenApi.from_map/1` into the struct
     hierarchy.
  3. Walk every `(path, verb)` pair, keep operations whose `tags`
     include `"MCP"`.
  4. Build a `Trento.AI.OperationEntry` per operation. `tool_name` and
     `display_text` follow the same fallback chain used locally:
     `operation.extensions["x-ai-tool"]["name" | "display_text"]` →
     `operation.operationId` / `operation.summary` → derived
     `<verb>_<slugified path>` / `tool_name`.
  5. Extract the dispatch base URL from `spec.servers |> List.first()`'s
     `:url` field.
  6. Map each entry through `Trento.AI.RemoteHttpTool.build/2`, threading
     that base URL into the dispatcher's closure.

  ## Configuration

      config :trento, :ai,
        tool_sources: [
          ...,
          {Trento.AI.RemoteOpenApiToolSource,
           name: :wanda,
           spec_url: "http://localhost:4001/api/all/openapi"}
        ]

  The base URL used for tool invocations comes from `spec.servers[0].url`
  in the fetched OpenAPI document — the spec itself is the source of
  truth. Relative server URLs (no http/https scheme) are resolved against
  `tool_context.request_origin` at request time — see
  `Trento.AI.RemoteHttpTool`.

  Spec-fetch failures, and specs missing a usable `servers[0].url`, are
  logged and the source contributes `[]` for the current call; other
  configured sources still surface their tools.
  """

  @behaviour Trento.AI.ToolSource

  require Logger

  alias Trento.AI.ApplicationConfigLoader
  alias Trento.AI.{OperationEntry, RemoteHttpTool}

  @mcp_tag "MCP"
  @x_ai_tool_extension "x-ai-tool"
  @default_recv_timeout 15_000

  @impl true
  def tools(opts) do
    name = Keyword.fetch!(opts, :name)
    spec_url = Keyword.fetch!(opts, :spec_url)

    case fetch_and_decode(spec_url) do
      {:ok, spec} ->
        build_tools(spec, name)

      {:error, reason} ->
        Logger.warning(
          "Trento.AI.RemoteOpenApiToolSource[#{inspect(name)}]: spec fetch failed " <>
            "(#{inspect(reason)}); this source contributes no tools for this call."
        )

        []
    end
  end

  defp build_tools(spec, name) do
    case extract_base_url(spec) do
      {:ok, base_url} ->
        spec
        |> build_entries()
        |> Enum.map(&RemoteHttpTool.build(&1, base_url))

      {:error, reason} ->
        Logger.warning("Trento.AI.RemoteOpenApiToolSource[#{inspect(name)}]: #{reason}")
        []
    end
  end

  defp extract_base_url(%OpenApiSpex.OpenApi{
         servers: [%OpenApiSpex.Server{url: url} | _]
       })
       when is_binary(url) and url != "",
       do: {:ok, url}

  defp extract_base_url(_),
    do: {:error, "spec missing servers[0].url; this source contributes no tools for this call."}

  defp fetch_and_decode(spec_url) do
    headers = [{"accept", "application/json"}]
    options = [recv_timeout: @default_recv_timeout]

    with {:ok, %HTTPoison.Response{status_code: 200, body: body}} <-
           http_client().get(spec_url, headers, options),
         {:ok, json} <- Jason.decode(body) do
      {:ok, OpenApiSpex.OpenApi.from_map(json)}
    else
      {:ok, %HTTPoison.Response{status_code: status}} -> {:error, {:http_status, status}}
      {:error, %HTTPoison.Error{reason: reason}} -> {:error, {:transport, reason}}
      {:error, %Jason.DecodeError{} = err} -> {:error, {:invalid_json, err}}
      other -> {:error, {:unexpected, other}}
    end
  end

  defp build_entries(%OpenApiSpex.OpenApi{paths: paths}) when is_map(paths) do
    for {path, %OpenApiSpex.PathItem{} = path_item} <- paths,
        {verb, operation} <- Map.from_struct(path_item),
        is_struct(operation, OpenApiSpex.Operation),
        @mcp_tag in (operation.tags || []) do
      build_entry(path, verb, operation)
    end
  end

  defp build_entries(_), do: []

  defp build_entry(path, verb, %OpenApiSpex.Operation{} = operation) do
    overrides = ai_tool_overrides(operation)

    %OperationEntry{
      tool_name: tool_name(overrides, operation, verb, path),
      display_text: display_text(overrides, operation),
      operation: normalize_operation(operation),
      verb: verb,
      path: path
    }
  end

  defp ai_tool_overrides(%OpenApiSpex.Operation{extensions: %{} = exts}) do
    case Map.get(exts, @x_ai_tool_extension) do
      %{} = m -> m
      _ -> %{}
    end
  end

  defp ai_tool_overrides(_), do: %{}

  defp tool_name(%{"name" => name}, _operation, _verb, _path)
       when is_binary(name) and name != "",
       do: name

  defp tool_name(_, %OpenApiSpex.Operation{operationId: op_id}, _verb, _path)
       when is_binary(op_id) and op_id != "",
       do: op_id

  defp tool_name(_, _operation, verb, path), do: "#{verb}_#{slugify(path)}"

  defp display_text(%{"display_text" => display}, _operation)
       when is_binary(display) and display != "",
       do: display

  defp display_text(_, %OpenApiSpex.Operation{summary: summary})
       when is_binary(summary) and summary != "",
       do: summary

  defp display_text(_, _), do: nil

  # Mirror McpRouteIndex.build_entry/1 — Operation.deprecated is typed
  # boolean but defaults to nil; dialyzer complains downstream.
  defp normalize_operation(%OpenApiSpex.Operation{deprecated: nil} = op),
    do: %{op | deprecated: false}

  defp normalize_operation(op), do: op

  defp slugify(path) do
    path
    |> String.replace(~r/[\/{}]+/, "_")
    |> String.trim("_")
    |> String.downcase()
  end

  defp http_client,
    do: Keyword.fetch!(ApplicationConfigLoader.load(), :http_client)
end
