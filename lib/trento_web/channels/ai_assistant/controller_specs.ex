# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.AIAssistant.ControllerSpecs do
  @moduledoc """
  Per-action AI-tool metadata macro. Mirrors the shape of
  `OpenApiSpex.ControllerSpecs.operation/2` so it sits naturally next to
  existing operation declarations in controllers.

      operation :list,
        tags: ["Target Infrastructure", "MCP"],
        summary: "List hosts."

      ai_tool :list,
        name: "Host_list",          # optional — defaults to <Stem>_<action>
        display_text: "List hosts"  # optional — defaults to operation.summary

  Overrides are read at compile time by
  `TrentoWeb.AIAssistant.ToolCatalog` via the generated `__ai_tool__/1`
  function. Controllers without any `ai_tool/2` declaration still get
  derivation-based defaults — wiring is fully opt-in.
  """

  defmacro __using__(_opts) do
    quote do
      import TrentoWeb.AIAssistant.ControllerSpecs, only: [ai_tool: 2]
      Module.register_attribute(__MODULE__, :ai_tool_overrides, accumulate: true)
      @before_compile TrentoWeb.AIAssistant.ControllerSpecs
    end
  end

  @doc """
  Declare AI-tool metadata for a controller action.

  Supported options:
    * `:name` — string. Overrides the derived `<Stem>_<action>` tool name.
    * `:display_text` — string. Overrides `operation.summary` as the
      human-friendly label rendered in the AG-UI tool-call card.
  """
  defmacro ai_tool(action, opts) do
    quote bind_quoted: [action: action, opts: opts] do
      @ai_tool_overrides {action, Map.new(opts)}
    end
  end

  defmacro __before_compile__(env) do
    overrides =
      env.module
      |> Module.get_attribute(:ai_tool_overrides, [])
      |> Map.new()
      |> Macro.escape()

    quote do
      @doc false
      def __ai_tool__(action), do: Map.get(unquote(overrides), action, %{})
    end
  end
end
