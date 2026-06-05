# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.ToolsRegistryTest do
  use ExUnit.Case, async: true

  import Mox

  alias LangChain.Function
  alias Trento.AI.ToolsRegistry

  setup :verify_on_exit!

  defmodule SourceA do
    @behaviour Trento.AI.ToolSource

    @impl true
    def tools, do: [Function.new!(%{name: "a", function: fn _, _ -> "a" end})]
  end

  defmodule SourceB do
    @behaviour Trento.AI.ToolSource

    @impl true
    def tools,
      do: [
        Function.new!(%{name: "b1", function: fn _, _ -> "b1" end}),
        Function.new!(%{name: "b2", function: fn _, _ -> "b2" end})
      ]
  end

  defmodule EmptySource do
    @behaviour Trento.AI.ToolSource

    @impl true
    def tools, do: []
  end

  defp expect_config(config) do
    expect(Trento.AI.ApplicationConfigLoader.Mock, :load_config, fn -> config end)
  end

  describe "tools/0" do
    test "flat-concats tools from every configured source in declaration order" do
      expect_config(tool_sources: [SourceA, SourceB])

      assert [%Function{name: "a"}, %Function{name: "b1"}, %Function{name: "b2"}] =
               ToolsRegistry.tools()
    end

    test "preserves declaration order across sources" do
      expect_config(tool_sources: [SourceB, SourceA])

      assert ["b1", "b2", "a"] = Enum.map(ToolsRegistry.tools(), & &1.name)
    end

    test "returns an empty list when :tool_sources is missing" do
      expect_config([])

      assert ToolsRegistry.tools() == []
    end

    test "returns an empty list when :tool_sources is an empty list" do
      expect_config(tool_sources: [])

      assert ToolsRegistry.tools() == []
    end

    test "tolerates a source that returns no tools" do
      expect_config(tool_sources: [EmptySource, SourceA])

      assert [%Function{name: "a"}] = ToolsRegistry.tools()
    end
  end
end
