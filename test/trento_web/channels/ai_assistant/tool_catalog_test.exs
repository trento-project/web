# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.AIAssistant.ToolCatalogTest do
  use ExUnit.Case, async: true

  alias TrentoWeb.AIAssistant.ToolCatalog
  alias TrentoWeb.AIAssistant.ToolCatalog.Entry
  alias TrentoWeb.V1

  describe "entries/0" do
    test "returns a non-empty list of fully populated %Entry{} structs" do
      entries = ToolCatalog.entries()

      assert is_list(entries)
      assert length(entries) > 0

      for %Entry{
            controller: c,
            action: a,
            verb: verb,
            path: path,
            tool_name: name,
            operation: op
          } <- entries do
        assert is_atom(c)
        assert is_atom(a)
        assert verb in [:get, :post, :put, :patch, :delete]
        assert is_binary(path)
        assert is_binary(name) and name != ""
        assert %OpenApiSpex.Operation{} = op
      end
    end

    test "every entry corresponds to an MCP-tagged OpenApiSpex operation (filter is correct)" do
      for %Entry{operation: %OpenApiSpex.Operation{tags: tags}} <- ToolCatalog.entries() do
        assert "MCP" in (tags || [])
      end
    end

    test "every catalog entry has a unique tool_name" do
      names = Enum.map(ToolCatalog.entries(), & &1.tool_name)
      assert length(names) == length(Enum.uniq(names))
    end

    test "every catalog entry has a unique {controller, action}" do
      keys = Enum.map(ToolCatalog.entries(), fn %Entry{controller: c, action: a} -> {c, a} end)
      assert length(keys) == length(Enum.uniq(keys))
    end

    test "default tool_name follows <Stem>_<action> derivation" do
      host_entry = find_entry(V1.HostController, :list)
      sap_entry = find_entry(V1.SapSystemController, :list)
      cluster_entry = find_entry(TrentoWeb.V2.ClusterController, :list)

      assert host_entry.tool_name == "Host_list"
      assert sap_entry.tool_name == "SapSystem_list"
      assert cluster_entry.tool_name == "Cluster_list"
    end

    test "default display_text comes from operation.summary" do
      host_entry = find_entry(V1.HostController, :list)
      assert host_entry.display_text == host_entry.operation.summary
    end

    test "ai_tool/2 override wins over derivation (V1.UsersController :index)" do
      entry = find_entry(V1.UsersController, :index)
      assert entry.tool_name == "Users_list"
      assert entry.display_text == "List users"
    end

    test "catalog size matches the number of MCP-tagged operations in v1/v2 controllers" do
      {grep_count, 0} =
        System.cmd("bash", [
          "-c",
          ~s(grep -rE 'tags:.*"MCP"' lib/trento_web/controllers/ | wc -l)
        ])

      expected = grep_count |> String.trim() |> String.to_integer()
      assert length(ToolCatalog.entries()) == expected
    end

  end

  defp find_entry(controller, action) do
    Enum.find(ToolCatalog.entries(), fn e ->
      e.controller == controller and e.action == action
    end) ||
      flunk("no catalog entry for #{inspect(controller)}.#{action}")
  end
end
