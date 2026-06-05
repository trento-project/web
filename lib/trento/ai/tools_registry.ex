# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.ToolsRegistry do
  @moduledoc """
  Aggregates AI assistant tools from every configured
  `Trento.AI.ToolSource`.

  The list of source modules is read at call time from
  `config :trento, :ai, tool_sources: [...]` via
  `Trento.AI.ApplicationConfigLoader`. Each source contributes a list
  of `LangChain.Function` structs; the aggregator flat-concats them in
  declaration order with no dedup — name collisions are configuration
  errors and should be surfaced loudly by LangChain.
  """

  alias Trento.AI.ApplicationConfigLoader

  @spec tools() :: [LangChain.Function.t()]
  def tools, do: Enum.flat_map(sources(), & &1.tools())

  defp sources, do: Keyword.get(ApplicationConfigLoader.load(), :tool_sources, [])
end
