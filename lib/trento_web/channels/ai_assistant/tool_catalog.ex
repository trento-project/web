# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.AIAssistant.ToolCatalog do
  @moduledoc """
  Compile-time registry of AI assistant tools, auto-discovered from the
  Phoenix router + OpenApiSpex operations.

  Every route whose controller declares an OpenApiSpex operation tagged
  `"MCP"` becomes a catalog entry. The same `"MCP"` tag is used by the
  trento MCP server to decide which REST endpoints to expose remotely —
  so the AI assistant's tool set and the MCP server's tool set stay
  aligned automatically.

  `tool_name` defaults to `<ControllerStem>_<action>` and `display_text`
  defaults to `operation.summary`. Either can be overridden per action
  via the `ai_tool/2` macro from
  `TrentoWeb.AIAssistant.ControllerSpecs`.

  Entries materialize at compile time into a module attribute, so
  `entries/0` is a free runtime lookup.
  """

  alias TrentoWeb.AIAssistant.ToolCatalog.Entry

  # Compile-time dependency on the router so route edits trigger recompile,
  # AND so Mix's compile-time dependency tracker orders Router before this
  # module — without it `__routes__/0` returns `[]` when this module compiles
  # in parallel with (or before) the router.
  @external_resource Path.expand("../../../router.ex", __DIR__)
  require TrentoWeb.Router

  @entries (for route <- TrentoWeb.Router.__routes__(),
                function_exported?(route.plug, :open_api_operation, 1),
                operation = OpenApiSpex.Operation.from_route(route),
                is_struct(operation, OpenApiSpex.Operation),
                "MCP" in (operation.tags || []) do
              overrides =
                if function_exported?(route.plug, :__ai_tool__, 1),
                  do: route.plug.__ai_tool__(route.plug_opts),
                  else: %{}

              stem =
                route.plug
                |> Module.split()
                |> List.last()
                |> String.replace_suffix("Controller", "")

              derived_name = "#{stem}_#{route.plug_opts}"

              derived_display =
                case operation.summary do
                  s when is_binary(s) and s != "" -> s
                  _ -> nil
                end

              %Entry{
                controller: route.plug,
                action: route.plug_opts,
                verb: route.verb,
                path: route.path,
                tool_name: overrides[:name] || derived_name,
                display_text: overrides[:display_text] || derived_display,
                operation: operation
              }
            end)

  @spec entries() :: [Entry.t()]
  def entries, do: @entries
end
