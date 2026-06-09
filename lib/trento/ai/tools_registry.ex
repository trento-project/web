# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.ToolsRegistry do
  @moduledoc """
  Aggregates AI assistant tools from every configured
  `Trento.AI.ToolSource`.

  The list of source modules is read from
  `config :trento, :ai, tool_sources: [...]` via
  `Trento.AI.ApplicationConfigLoader`. Each entry is either:

  - a bare module `MyToolSource` — normalised to `{MyToolSource, []}`, or
  - a `{module, opts}` tuple — passed through as-is.

  Every source's `tools/1` callback is invoked with its opts list (empty
  for bare-module entries). Sources are flat-concatenated in declaration
  order; name collisions are configuration errors and should surface
  loudly via LangChain.
  """

  alias Trento.AI.ApplicationConfigLoader

  @spec tools() :: [LangChain.Function.t()]
  def tools do
    Enum.flat_map(configured_sources(), fn {module, opts} -> module.tools(opts) end)
  end

  defp configured_sources do
    ApplicationConfigLoader.load()
    |> Keyword.get(:tool_sources, [])
    |> Enum.map(&normalize_entry/1)
  end

  defp normalize_entry({module, opts}) when is_atom(module) and is_list(opts), do: {module, opts}
  defp normalize_entry(module) when is_atom(module), do: {module, []}
end
