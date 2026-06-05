# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.ToolSource do
  @moduledoc """
  Behaviour for modules that contribute AI assistant tools to
  `Trento.AI.ToolsRegistry`.

  A source returns a list of ready-to-use `LangChain.Function` structs.
  How those functions are produced is entirely up to the implementation
  (controller-derived, native, MCP remote, ...).

  Sources are wired in via the `:tool_sources` key under
  `config :trento, :ai, ...` and aggregated at call time.
  """

  @callback tools() :: [LangChain.Function.t()]
end
