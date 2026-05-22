# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.AIAssistant.ToolCatalogTest do
  use ExUnit.Case, async: true

  alias TrentoWeb.AIAssistant.ToolCatalog
  alias TrentoWeb.AIAssistant.ToolCatalog.Entry
  alias TrentoWeb.V1

  describe "entries/0" do
    test "returns a non-empty list of %Entry{} structs" do
      entries = ToolCatalog.entries()

      assert is_list(entries)
      assert length(entries) > 0
      assert Enum.all?(entries, &match?(%Entry{}, &1))
    end

    test "every entry's {controller, action} resolves to an MCP-tagged OpenApiSpex operation" do
      for %Entry{controller: controller, action: action} <- ToolCatalog.entries() do
        operation = controller.open_api_operation(action)

        assert operation,
               "no open_api_operation for #{inspect(controller)}.#{action}"

        assert "MCP" in (operation.tags || []),
               "#{inspect(controller)}.#{action} is in the catalog but is not MCP-tagged"
      end
    end

    test "every catalog entry has a tool_name and a display_text" do
      for %Entry{tool_name: tn, display_text: dt} <- ToolCatalog.entries() do
        assert is_binary(tn) and tn != ""
        assert is_binary(dt) and dt != ""
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

    test "Host_list and Cluster_list tool_names are preserved (system-prompt compat)" do
      host_entry =
        Enum.find(ToolCatalog.entries(), fn e ->
          e.controller == V1.HostController and e.action == :list
        end)

      cluster_entry =
        Enum.find(ToolCatalog.entries(), fn e ->
          e.controller == V1.ClusterController and e.action == :list
        end)

      assert host_entry.tool_name == "Host_list"
      assert cluster_entry.tool_name == "Cluster_list"
    end
  end

  describe "route!/1" do
    test "returns the HTTP verb and path template from the router" do
      entry =
        Enum.find(ToolCatalog.entries(), fn e ->
          e.controller == V1.HostController and e.action == :list
        end)

      assert %{verb: :get, path: "/api/v1/hosts"} = ToolCatalog.route!(entry)
    end

    test "returns path templates with :param placeholders" do
      entry =
        Enum.find(ToolCatalog.entries(), fn e ->
          e.controller == V1.HostController and e.action == :request_checks_execution
        end)

      assert %{verb: :post, path: "/api/v1/hosts/:id/checks/request_execution"} =
               ToolCatalog.route!(entry)
    end

    test "raises ArgumentError for an unknown {controller, action}" do
      entry = %Entry{
        controller: V1.HostController,
        action: :nonexistent_action,
        tool_name: "fake",
        display_text: "fake"
      }

      assert_raise ArgumentError, ~r/no route registered/, fn ->
        ToolCatalog.route!(entry)
      end
    end

    test "every catalog entry resolves to a route" do
      for entry <- ToolCatalog.entries() do
        assert %{verb: verb, path: path} = ToolCatalog.route!(entry)
        assert verb in [:get, :post, :put, :patch, :delete]
        assert is_binary(path)
      end
    end
  end
end
