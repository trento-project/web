# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.ControllerSpecs do
  @moduledoc """
  Per-action AI-tool metadata macro. Sits next to `OpenApiSpex.ControllerSpecs.operation/2`
  in controllers and labels the immediately following public function as an AI tool.

      operation :index,
        tags: ["User Management", "MCP"],
        summary: "Gets the list of users in the system."

      ai_tool :users_list, display_text: "List users"

      def index(conn, _params), do: ...

  The first positional argument is the **tool name** as an atom; it becomes
  the LLM-facing identifier verbatim via `Atom.to_string/1` (no casing
  transform). The controller action the override applies to is inferred
  from the immediately following public `def` via `@on_definition`.

  Supported options:
    * `:display_text` — string. Overrides `operation.summary` as the human-friendly label
      rendered in the AG-UI tool-call card.
  """

  defmacro __using__(_opts) do
    quote do
      import Trento.AI.ControllerSpecs, only: [ai_tool: 1, ai_tool: 2]
      Module.register_attribute(__MODULE__, :ai_tool_overrides, accumulate: true)
      Module.register_attribute(__MODULE__, :pending_ai_tool, accumulate: false)
      @on_definition Trento.AI.ControllerSpecs
      @before_compile Trento.AI.ControllerSpecs
    end
  end

  @doc """
  Label the next public `def` as an AI tool.

  The first argument is the tool name as an atom. Options:
    * `:display_text` — human-friendly label (defaults to `operation.summary`).
  """
  defmacro ai_tool(tool_name, opts \\ []) when is_atom(tool_name) do
    quote bind_quoted: [tool_name: tool_name, opts: opts] do
      @pending_ai_tool {tool_name, Map.new(opts)}
    end
  end

  @doc false
  def __on_definition__(env, :def, action, _args, _guards, _body) do
    case Module.get_attribute(env.module, :pending_ai_tool) do
      nil ->
        :ok

      {tool_name, opts} ->
        Module.put_attribute(env.module, :ai_tool_overrides, {action, tool_name, opts})
        Module.delete_attribute(env.module, :pending_ai_tool)
    end
  end

  # `defp` / `defmacro` etc. don't consume the pending binding — helpers
  # placed between `ai_tool/2` and the action don't steal the label.
  def __on_definition__(_env, _kind, _name, _args, _guards, _body), do: :ok

  defmacro __before_compile__(env) do
    overrides =
      env.module
      |> Module.get_attribute(:ai_tool_overrides, [])
      |> Map.new(fn {action, tool_name, opts} ->
        {action, Map.put(opts, :name, Atom.to_string(tool_name))}
      end)
      |> Macro.escape()

    quote do
      @doc false
      def __ai_tool__(action), do: Map.get(unquote(overrides), action, %{})
    end
  end
end
