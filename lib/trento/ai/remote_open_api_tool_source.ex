# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.RemoteOpenApiToolSource do
  @moduledoc """
  `Trento.AI.ToolSource` implementation that derives AI assistant tools
  from a remote service's OpenAPI document.

  At `tools/1` time:

  1. Fetch the spec from `:spec_url` (HTTP GET, JSON response).
  2. Decode via `OpenApiSpex.OpenApi.Decode.decode/1` into the struct
     hierarchy.
  3. Walk every `(path, verb)` pair, keep operations whose `tags`
     include `"MCP"`.
  4. Build a `Trento.AI.OperationEntry` per operation. `tool_name` and
     `display_text` follow the same fallback chain used locally:
     `operation.extensions["x-ai-tool"]["name" | "display_text"]` →
     `operation.operation_id` / `operation.summary` → derived
     `\#{verb}_<slugified path>` / `tool_name`.
  5. Map each entry through `Trento.AI.RemoteHttpTool.build/2`.

  Every `Trento.AI.ToolsRegistry.refresh!/0` re-fetches the spec; the
  registry caches only the aggregated tool list, so there is no
  per-source short-circuit.

  ## Configuration

      config :trento, :ai,
        tool_sources: [
          ...,
          {Trento.AI.RemoteOpenApiToolSource,
           name: :wanda,
           spec_url: "http://localhost:4001/api/all/openapi",
           base_url: "http://localhost:4001"}
        ]

  Spec-fetch failures are logged and raise so that `Trento.AI.ToolsRegistry`
  treats this source as contributing `[]` for the current refresh; the
  agent still boots with whatever other sources succeeded.
  """

  @behaviour Trento.AI.ToolSource

  require Logger

  alias Trento.AI.{HttpClient, OperationEntry, RemoteHttpTool}

  @verbs [:get, :put, :post, :delete, :options, :head, :patch, :trace]
  @mcp_tag "MCP"
  @x_ai_tool_extension "x-ai-tool"
  @default_recv_timeout 15_000

  @impl true
  def tools(opts) do
    name = Keyword.fetch!(opts, :name)
    spec_url = Keyword.fetch!(opts, :spec_url)
    base_url = Keyword.fetch!(opts, :base_url)

    case fetch_and_decode(spec_url) do
      {:ok, spec} ->
        entries = build_entries(spec, name)
        Enum.map(entries, &RemoteHttpTool.build(&1, base_url))

      {:error, reason} ->
        Logger.warning(
          "Trento.AI.RemoteOpenApiToolSource[#{inspect(name)}]: spec fetch failed " <>
            "(#{inspect(reason)}); this source contributes no tools for this refresh."
        )

        # Raise so ToolsRegistry.materialise_one's rescue treats this
        # source as []; other sources still contribute. The registry no
        # longer keeps a per-source cache, so there is no stale list to
        # fall back to — losing that path was the trade-off accepted when
        # the per-source cache was removed.
        raise "spec fetch failed: #{inspect(reason)}"
    end
  end

  defp fetch_and_decode(spec_url) do
    headers = [{"accept", "application/json"}]
    options = [recv_timeout: @default_recv_timeout]

    with {:ok, %HTTPoison.Response{status_code: 200, body: body}} <-
           HttpClient.impl().get(spec_url, headers, options),
         {:ok, json} <- Jason.decode(body) do
      {:ok, OpenApiSpex.OpenApi.Decode.decode(json)}
    else
      {:ok, %HTTPoison.Response{status_code: status}} -> {:error, {:http_status, status}}
      {:error, %HTTPoison.Error{reason: reason}} -> {:error, {:transport, reason}}
      {:error, %Jason.DecodeError{} = err} -> {:error, {:invalid_json, err}}
      other -> {:error, {:unexpected, other}}
    end
  end

  defp build_entries(%OpenApiSpex.OpenApi{paths: paths}, source_name) when is_map(paths) do
    for {path, %OpenApiSpex.PathItem{} = path_item} <- paths,
        verb <- @verbs,
        operation = Map.get(path_item, verb),
        is_struct(operation, OpenApiSpex.Operation),
        @mcp_tag in (operation.tags || []) do
      build_entry(source_name, path, verb, operation)
    end
  end

  defp build_entries(_, _), do: []

  defp build_entry(source_name, path, verb, %OpenApiSpex.Operation{} = operation) do
    overrides = ai_tool_overrides(operation)

    %OperationEntry{
      source: source_name,
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
end
