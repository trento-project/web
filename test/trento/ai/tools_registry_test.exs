# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.ToolsRegistryTest do
  # Not async: :persistent_term is global. Tests mutate the same keys.
  use ExUnit.Case, async: false

  import Mox

  alias LangChain.Function
  alias Trento.AI.ToolsRegistry

  setup :verify_on_exit!

  setup do
    ToolsRegistry.clear!()
    on_exit(fn -> ToolsRegistry.clear!() end)
    :ok
  end

  defmodule SourceA do
    @behaviour Trento.AI.ToolSource

    @impl true
    def tools(_opts), do: [Function.new!(%{name: "a", function: fn _, _ -> "a" end})]
  end

  defmodule SourceB do
    @behaviour Trento.AI.ToolSource

    @impl true
    def tools(_opts),
      do: [
        Function.new!(%{name: "b1", function: fn _, _ -> "b1" end}),
        Function.new!(%{name: "b2", function: fn _, _ -> "b2" end})
      ]
  end

  defmodule EmptySource do
    @behaviour Trento.AI.ToolSource

    @impl true
    def tools(_opts), do: []
  end

  defmodule OptsSource do
    @behaviour Trento.AI.ToolSource

    @impl true
    def tools(opts) do
      name = Keyword.fetch!(opts, :name)
      [Function.new!(%{name: "#{name}_tool", function: fn _, _ -> name end})]
    end
  end

  defmodule RaisingSource do
    @behaviour Trento.AI.ToolSource

    @impl true
    def tools(_opts), do: raise("boom")
  end

  defp stub_config(config) do
    stub(Trento.AI.ApplicationConfigLoader.Mock, :load_config, fn -> config end)
  end

  describe "tools/0" do
    test "flat-concats tools from every configured source in declaration order" do
      stub_config(tool_sources: [SourceA, SourceB])

      assert [%Function{name: "a"}, %Function{name: "b1"}, %Function{name: "b2"}] =
               ToolsRegistry.tools()
    end

    test "preserves declaration order across sources" do
      stub_config(tool_sources: [SourceB, SourceA])

      assert ["b1", "b2", "a"] = Enum.map(ToolsRegistry.tools(), & &1.name)
    end

    test "returns an empty list when :tool_sources is missing" do
      stub_config([])

      assert ToolsRegistry.tools() == []
    end

    test "returns an empty list when :tool_sources is an empty list" do
      stub_config(tool_sources: [])

      assert ToolsRegistry.tools() == []
    end

    test "tolerates a source that returns no tools" do
      stub_config(tool_sources: [EmptySource, SourceA])

      assert [%Function{name: "a"}] = ToolsRegistry.tools()
    end

    test "serves subsequent calls from :persistent_term cache" do
      # First tools/0 misses the aggregated cache and triggers
      # refresh!/0, which loads config once. Subsequent tools/0 calls hit
      # the cached aggregated list and skip configured_sources/0 entirely.
      stub_config(tool_sources: [SourceA])

      _first = ToolsRegistry.tools()
      _second = ToolsRegistry.tools()

      assert [%Function{name: "a"}] = ToolsRegistry.tools()
    end
  end

  describe "{module, opts} entries" do
    test "invokes tools/1 with opts when entry is a tuple" do
      stub_config(tool_sources: [{OptsSource, name: :alpha}])

      assert [%Function{name: "alpha_tool"}] = ToolsRegistry.tools()
    end

    test "supports mixed bare-module + tuple entries" do
      stub_config(tool_sources: [SourceA, {OptsSource, name: :beta}])

      assert ["a", "beta_tool"] = Enum.map(ToolsRegistry.tools(), & &1.name)
    end
  end

  describe "failure tolerance" do
    test "logs + drops a raising source while keeping the rest" do
      # Healthy + raising source mixed. The raising source contributes
      # [] (no per-source cache to fall back to); the healthy source's
      # tools still surface in the aggregated list.
      stub_config(tool_sources: [SourceA, RaisingSource])

      assert [%Function{name: "a"}] = ToolsRegistry.refresh!()
    end
  end
end
