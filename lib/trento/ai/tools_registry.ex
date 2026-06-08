# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.ToolsRegistry do
  @moduledoc """
  Aggregates AI assistant tools from every configured
  `Trento.AI.ToolSource`.

  The list of source modules is read from
  `config :trento, :ai, tool_sources: [...]` via
  `Trento.AI.ApplicationConfigLoader`. Each entry is either:

  - a bare module `MyToolSource` — invoked as `tools/0`, or
  - a `{module, opts}` tuple — invoked as `tools/1` with `opts`.

  Sources are flat-concatenated in declaration order; name collisions
  are configuration errors and should surface loudly via LangChain.

  ## Caching

  Both the per-source tool lists AND the aggregated list are cached in
  `:persistent_term`. `tools/0` is a pure read against the cached
  aggregated list, so it stays cheap regardless of how expensive
  individual sources are to materialise (remote HTTP fetch, OpenAPI
  decode, …).

  Cache lifecycle:

  - `refresh!/0` re-materialises every configured source, stores each
    under its per-source key, and writes the aggregated list.
  - `refresh!/1` re-materialises a single source by name.
  - `clear!/0` erases every cache key. Useful in tests.
  - `tools/0` reads the aggregated key; if absent (first call before
    boot warm), it transparently triggers `refresh!/0`.

  Boot warming is wired in `Trento.Application` and gated by the
  `:warm_tool_cache_at_boot` AI config flag.
  """

  require Logger

  alias Trento.AI.ApplicationConfigLoader

  @aggregated_key {:trento_ai_tools, :__aggregated__}
  @source_key_prefix {:trento_ai_tools, :__source__}

  @spec tools() :: [LangChain.Function.t()]
  def tools do
    refresh!()
    # case :persistent_term.get(@aggregated_key, :__miss__) |> IO.inspect(label: "cached Agent tools") do
    #   :__miss__ -> refresh!()
    #   cached -> cached
    # end
  end

  @doc """
  Force-rebuilds every configured source's tool list, replaces both the
  per-source caches and the aggregated cache, and returns the aggregated
  list. Source-level failures are caught and logged so a single bad
  source can't take the whole registry down.
  """
  @spec refresh!() :: [LangChain.Function.t()]
  def refresh! do
    aggregated =
      Enum.flat_map(configured_sources(), fn {module, opts} ->
        materialise_and_cache(module, opts)
      end)

    :persistent_term.put(@aggregated_key, aggregated)
    aggregated
  end

  @doc """
  Refreshes a single source by `:name` (from its opts) or by module if
  the entry was passed as a bare module. Also refreshes the aggregated
  cache so the new contribution is visible to `tools/0`.
  """
  @spec refresh!(atom() | module()) :: [LangChain.Function.t()]
  def refresh!(name_or_module) do
    case Enum.find(configured_sources(), fn {module, opts} ->
           source_id(module, opts) == name_or_module
         end) do
      {module, opts} ->
        fresh = materialise_and_cache(module, opts)
        rebuild_aggregated()
        fresh

      nil ->
        Logger.warning(
          "Trento.AI.ToolsRegistry.refresh!/1: no source configured for #{inspect(name_or_module)}"
        )

        []
    end
  end

  @doc """
  Erases every per-source and aggregated cache key. Walks
  `:persistent_term.get/0` so it does not depend on the current
  `:tool_sources` configuration. Intended for tests and operational use;
  not called during normal runtime.
  """
  @spec clear!() :: :ok
  def clear! do
    for {key, _value} <- :persistent_term.get(), tools_registry_key?(key) do
      :persistent_term.erase(key)
    end

    :ok
  end

  defp tools_registry_key?(@aggregated_key), do: true
  defp tools_registry_key?({@source_key_prefix, _}), do: true
  defp tools_registry_key?(_), do: false

  defp materialise_and_cache(module, opts) do
    tools = invoke_source(module, opts)
    :persistent_term.put(source_key(module, opts), tools)
    tools
  rescue
    exception ->
      Logger.warning(
        "Trento.AI.ToolsRegistry: source #{inspect(module)} (#{inspect(opts)}) raised " <>
          Exception.format(:error, exception, __STACKTRACE__) <>
          " — leaving cache untouched."
      )

      :persistent_term.get(source_key(module, opts), [])
  end

  defp rebuild_aggregated do
    aggregated =
      Enum.flat_map(configured_sources(), fn {module, opts} ->
        :persistent_term.get(source_key(module, opts), [])
      end)

    :persistent_term.put(@aggregated_key, aggregated)
    aggregated
  end

  defp invoke_source(module, opts) do
    Code.ensure_loaded?(module)

    cond do
      function_exported?(module, :tools, 1) -> module.tools(opts)
      function_exported?(module, :tools, 0) -> module.tools()
      true -> raise "Source #{inspect(module)} must export tools/0 or tools/1"
    end
  end

  defp configured_sources do
    ApplicationConfigLoader.load()
    |> Keyword.get(:tool_sources, [])
    |> Enum.map(&normalize_entry/1)
  end

  defp normalize_entry({module, opts}) when is_atom(module) and is_list(opts), do: {module, opts}
  defp normalize_entry(module) when is_atom(module), do: {module, []}

  defp source_id(module, opts), do: Keyword.get(opts, :name, module)

  defp source_key(module, opts) do
    {@source_key_prefix, source_id(module, opts)}
  end
end
