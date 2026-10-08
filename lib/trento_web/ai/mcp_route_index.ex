# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.AI.McpRouteIndex do
  @moduledoc """
  Index of MCP-tagged controller routes, built on demand from the
  Phoenix router + OpenApiSpex operations.

  Consumed by `TrentoWeb.AI.ControllerToolSource` to materialise AI
  assistant tools — see also `Trento.AI.ToolsRegistry`, the
  aggregator that pulls together every configured
  `Trento.AI.ToolSource`.

  Every route whose controller declares an OpenApiSpex operation
  tagged `"MCP"` becomes a catalog entry. The same `"MCP"` tag is
  used by the trento MCP server, so the AI assistant's tool set and
  the MCP server's stay aligned automatically.

  `tool_name` defaults to `<ControllerStem>_<action>` (snake_case via
  `Macro.underscore/1`) and `display_text` defaults to
  `operation.summary`. Either can be overridden per action via the
  `ai_tool/2` macro from `Trento.AI.ControllerSpecs`.

  Each entry carries its HTTP verb + path template so dispatchers
  don't need to re-scan the router per tool call.
  """

  alias TrentoWeb.AI.McpRouteIndex.Entry

  @default_router TrentoWeb.Router

  @spec entries(module()) :: [Entry.t()]
  def entries(router \\ @default_router) do
    router
    |> extract_mcp_routes()
    |> Enum.map(&build_entry/1)
  end

  defp extract_mcp_routes(router) do
    for %{plug: controller} = route <- router.__routes__(),
        Code.ensure_loaded?(controller),
        function_exported?(controller, :open_api_operation, 1),
        operation = OpenApiSpex.Operation.from_route(route),
        is_struct(operation, OpenApiSpex.Operation),
        "MCP" in operation.tags,
        do: {route, operation}
  end

  defp build_entry({%{plug: controller, plug_opts: action, verb: verb, path: path}, operation}) do
    # Normalize operation to match OpenApiSpex.Operation.t() — the struct's
    # :deprecated field is typed `boolean` but defaults to `nil` when not set
    # in the controller's operation/2 block, which trips dialyzer.
    normalized_operation = %{operation | deprecated: operation.deprecated || false}

    overrides = get_ai_tool_options(controller, action)

    %Entry{
      controller: controller,
      action: action,
      tool_name: compute_tool_name(overrides, controller, action),
      display_text: compute_display_text(overrides, normalized_operation),
      operation: normalized_operation,
      verb: verb,
      path: path
    }
  end

  defp compute_tool_name(%{name: name}, _controller, _action) when not is_nil(name), do: name
  defp compute_tool_name(_, controller, action), do: derived_name(controller, action)

  defp compute_display_text(%{display_text: display_text}, _operation)
       when not is_nil(display_text),
       do: display_text

  defp compute_display_text(_, operation), do: derived_display_text(operation)

  defp get_ai_tool_options(controller, action) do
    case function_exported?(controller, :__ai_tool__, 1) do
      true -> controller.__ai_tool__(action)
      false -> %{}
    end
  end

  defp derived_name(controller, action) do
    controller
    |> Module.split()
    |> List.last()
    |> String.replace_suffix("Controller", "")
    |> Macro.underscore()
    |> Kernel.<>("_#{action}")
  end

  defp derived_display_text(%OpenApiSpex.Operation{summary: summary})
       when is_binary(summary) and summary != "",
       do: summary

  defp derived_display_text(_), do: nil
end
