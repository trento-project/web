# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.ToolSource do
  @moduledoc """
  Behaviour for modules that contribute AI assistant tools to
  `Trento.AI.ToolsRegistry`.

  A source returns a list of ready-to-use `LangChain.Function` structs.
  How those functions are produced is entirely up to the implementation
  (controller-derived, remote-OpenAPI, MCP remote, ...).

  Sources are wired in via the `:tool_sources` key under
  `config :trento, :ai, ...`. Each entry is either a bare module
  (callback invoked as `tools/0` with no options) or a `{module, opts}`
  tuple (callback invoked as `tools/1` with the opts kw list — typically
  carrying the source `:name`, `:spec_url`, `:base_url`, etc.).

  Implementations only need to define ONE of the two callbacks. The
  registry dispatches to `tools/1` when exported, otherwise to `tools/0`.
  """

  @callback tools() :: [LangChain.Function.t()]
  @callback tools(opts :: keyword()) :: [LangChain.Function.t()]

  @optional_callbacks tools: 0, tools: 1
end
