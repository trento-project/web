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

  ## Caching

  The aggregated tool list is cached in `:persistent_term` under a single
  key. `tools/0` is a pure read with refresh-on-miss, so it stays cheap
  regardless of how expensive individual sources are to materialise
  (remote HTTP fetch, OpenAPI decode, …).

  Cache lifecycle:

  - `refresh!/0` re-materialises every configured source and overwrites
    the aggregated cache. Sources that raise contribute `[]` and are
    logged; the rest still surface their tools.
  - `clear!/0` erases the aggregated key. Intended for tests.
  - `tools/0` reads the aggregated key; on miss it triggers `refresh!/0`.

  Boot warming is wired in `Trento.Application` and gated by the
  `:warm_tool_cache_at_boot` AI config flag.
  """

  require Logger

  alias Trento.AI.ApplicationConfigLoader

  @aggregated_key {:trento_ai_tools, :__aggregated__}

  @spec tools() :: [LangChain.Function.t()]
  def tools do
    case :persistent_term.get(@aggregated_key, :__miss__) do
      :__miss__ -> refresh!()
      cached -> cached
    end
  end

  @doc """
  Force-rebuilds every configured source's tool list and overwrites the
  aggregated cache. Source-level failures are caught and logged so a
  single bad source can't take the whole registry down — the failing
  source contributes `[]`.
  """
  @spec refresh!() :: [LangChain.Function.t()]
  def refresh! do
    aggregated =
      Enum.flat_map(configured_sources(), fn {module, opts} ->
        materialise_one(module, opts)
      end)

    :persistent_term.put(@aggregated_key, aggregated)
    aggregated
  end

  @doc """
  Erases the aggregated cache key. Intended for tests and operational
  use; not called during normal runtime.
  """
  @spec clear!() :: :ok
  def clear! do
    _ = :persistent_term.erase(@aggregated_key)
    :ok
  end

  defp materialise_one(module, opts) do
    module.tools(opts)
  rescue
    exception ->
      Logger.warning(
        "Trento.AI.ToolsRegistry: source #{inspect(module)} (#{inspect(opts)}) raised " <>
          Exception.format(:error, exception, __STACKTRACE__) <>
          " — contributing no tools."
      )

      []
  end

  defp configured_sources do
    ApplicationConfigLoader.load()
    |> Keyword.get(:tool_sources, [])
    |> Enum.map(&normalize_entry/1)
  end

  defp normalize_entry({module, opts}) when is_atom(module) and is_list(opts), do: {module, opts}
  defp normalize_entry(module) when is_atom(module), do: {module, []}
end
