# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.AI.McpRouteIndexTest do
  use ExUnit.Case, async: true

  alias TrentoWeb.AI.McpRouteIndex
  alias TrentoWeb.AI.McpRouteIndex.Entry
  alias TrentoWeb.V1

  describe "entries/1" do
    test "returns a non-empty list of fully populated %Entry{} structs" do
      entries = McpRouteIndex.entries()

      assert is_list(entries)
      assert entries != []

      for %Entry{
            controller: c,
            action: a,
            tool_name: name,
            operation: op
          } <- entries do
        assert is_atom(c)
        assert is_atom(a)
        assert is_binary(name) and name != ""
        assert %OpenApiSpex.Operation{} = op
      end
    end

    test "every entry corresponds to an MCP-tagged OpenApiSpex operation (filter is correct)" do
      for %Entry{operation: %OpenApiSpex.Operation{tags: tags}} <- McpRouteIndex.entries() do
        assert "MCP" in (tags || [])
      end
    end

    test "every catalog entry has a unique tool_name" do
      names = Enum.map(McpRouteIndex.entries(), & &1.tool_name)
      assert length(names) == length(Enum.uniq(names))
    end

    test "every catalog entry has a unique {controller, action}" do
      keys = Enum.map(McpRouteIndex.entries(), fn %Entry{controller: c, action: a} -> {c, a} end)
      assert length(keys) == length(Enum.uniq(keys))
    end

    test "every MCP action carries an ai_tool override with non-empty display_text" do
      for entry <- McpRouteIndex.entries() do
        assert is_binary(entry.display_text) and entry.display_text != ""
      end
    end

    test "spot-check explicit ai_tool tool_names from controllers" do
      assert find_entry(V1.HostController, :list).tool_name == "host_list"
      assert find_entry(V1.SapSystemController, :list).tool_name == "sap_system_list"
      assert find_entry(TrentoWeb.V2.ClusterController, :list).tool_name == "cluster_list"
      assert find_entry(V1.DatabaseController, :list_databases).tool_name == "database_list"
      assert find_entry(V1.HealthOverviewController, :overview).tool_name == "health_overview"
      assert find_entry(V1.AbilityController, :index).tool_name == "abilities_list"

      assert find_entry(V1.ActivityLogController, :get_activity_log).tool_name ==
               "get_activity_log"

      assert find_entry(V1.UsersController, :index).tool_name == "users_list"
      assert find_entry(V1.UsersController, :show).tool_name == "users_show"

      assert find_entry(V1.SettingsController, :get_api_key_settings).tool_name ==
               "settings_get_api_key"

      assert find_entry(V1.SUSEManagerController, :software_updates).tool_name ==
               "mlm_software_updates"
    end

    test "ai_tool/2 override sets display_text on the catalog entry" do
      entry = find_entry(V1.UsersController, :index)
      assert entry.display_text == "List users"
    end
  end

  describe "Entry carries verb + path from the route" do
    test "host_list → GET /api/v1/hosts" do
      entry = find_entry(V1.HostController, :list)
      assert %Entry{verb: :get, path: "/api/v1/hosts"} = entry
    end

    test "host_query_metrics preserves :id placeholder in path template" do
      entry = find_entry(V1.HostController, :query_metrics)
      assert %Entry{verb: :get, path: "/api/v1/hosts/:id/metrics/query"} = entry
    end

    test "POST entry preserves verb: :post on the route" do
      entry = find_entry(V1.HostController, :request_checks_execution)

      assert %Entry{verb: :post, path: "/api/v1/hosts/:id/checks/request_execution"} =
               entry
    end

    test "Entry requires :verb and :path at construction (@enforce_keys)" do
      assert_raise ArgumentError, fn ->
        struct!(Entry,
          controller: V1.HostController,
          action: :list,
          tool_name: "x",
          operation: %OpenApiSpex.Operation{responses: %{}}
        )
      end
    end
  end

  describe "entries/1 — display_text fallbacks via injected router" do
    defmodule FakeMcpController do
      def open_api_operation(:with_summary),
        do: %OpenApiSpex.Operation{
          responses: %{},
          summary: "Some summary",
          tags: ["MCP"]
        }

      def open_api_operation(:empty_summary),
        do: %OpenApiSpex.Operation{responses: %{}, summary: "", tags: ["MCP"]}

      def open_api_operation(:nil_summary),
        do: %OpenApiSpex.Operation{responses: %{}, summary: nil, tags: ["MCP"]}
    end

    defmodule FakeMcpRouter do
      def __routes__ do
        [
          %Phoenix.Router.Route{
            plug: FakeMcpController,
            plug_opts: :with_summary,
            verb: :get,
            path: "/fake/with_summary"
          },
          %Phoenix.Router.Route{
            plug: FakeMcpController,
            plug_opts: :empty_summary,
            verb: :get,
            path: "/fake/empty_summary"
          },
          %Phoenix.Router.Route{
            plug: FakeMcpController,
            plug_opts: :nil_summary,
            verb: :get,
            path: "/fake/nil_summary"
          }
        ]
      end
    end

    defp fake_entry(action) do
      Enum.find(McpRouteIndex.entries(FakeMcpRouter), &(&1.action == action)) ||
        flunk("no fake entry for #{inspect(action)}")
    end

    test "falls back to operation.summary when ai_tool/2 omits display_text" do
      assert %Entry{display_text: "Some summary"} = fake_entry(:with_summary)
    end

    test "derives tool_name from controller stem + action when ai_tool/2 absent" do
      assert %Entry{tool_name: "fake_mcp_with_summary"} = fake_entry(:with_summary)
    end

    test "returns nil display_text when operation.summary is empty" do
      assert %Entry{display_text: nil} = fake_entry(:empty_summary)
    end

    test "returns nil display_text when operation.summary is missing" do
      assert %Entry{display_text: nil} = fake_entry(:nil_summary)
    end
  end

  defp find_entry(controller, action) do
    Enum.find(McpRouteIndex.entries(), fn e ->
      e.controller == controller and e.action == action
    end) ||
      flunk("no catalog entry for #{inspect(controller)}.#{action}")
  end
end
