defmodule Trento.Infrastructure.Mcp.MockMcpClient do
  @moduledoc """
  Mocks MCP client calls for testing
  """

  @behaviour Trento.Infrastructure.Mcp.Gen

  @impl true
  def list_tools do
    tools = [
      %{
        "name" => "list_clusters",
        "description" => "List all Pacemaker clusters monitored by Trento",
        "inputSchema" => %{
          "type" => "object",
          "properties" => %{},
          "required" => []
        }
      },
      %{
        "name" => "get_cluster_details",
        "description" => "Get detailed information about a specific cluster",
        "inputSchema" => %{
          "type" => "object",
          "properties" => %{
            "cluster_id" => %{
              "type" => "string",
              "description" => "The unique identifier of the cluster"
            }
          },
          "required" => ["cluster_id"]
        }
      },
      %{
        "name" => "list_hosts",
        "description" => "List all hosts monitored by Trento",
        "inputSchema" => %{
          "type" => "object",
          "properties" => %{},
          "required" => []
        }
      },
      %{
        "name" => "get_host_details",
        "description" => "Get detailed information about a specific host",
        "inputSchema" => %{
          "type" => "object",
          "properties" => %{
            "host_id" => %{
              "type" => "string",
              "description" => "The unique identifier of the host"
            }
          },
          "required" => ["host_id"]
        }
      },
      %{
        "name" => "list_sap_systems",
        "description" => "List all SAP systems monitored by Trento",
        "inputSchema" => %{
          "type" => "object",
          "properties" => %{},
          "required" => []
        }
      },
      %{
        "name" => "get_health_overview",
        "description" => "Get overall health status of the infrastructure",
        "inputSchema" => %{
          "type" => "object",
          "properties" => %{},
          "required" => []
        }
      }
    ]

    {:ok, tools}
  end

  @impl true
  def call_tool(tool_name, arguments) do
    result = mock_tool_result(tool_name, arguments)
    {:ok, result}
  end

  defp mock_tool_result("list_clusters", _args) do
    %{
      "clusters" => [
        %{"id" => "cluster-1", "name" => "prod-hana-cluster", "health" => "passing"},
        %{"id" => "cluster-2", "name" => "dev-hana-cluster", "health" => "passing"},
        %{"id" => "cluster-3", "name" => "qa-hana-cluster", "health" => "warning"}
      ]
    }
  end

  defp mock_tool_result("get_cluster_details", %{"cluster_id" => cluster_id}) do
    %{
      "id" => cluster_id,
      "name" => "prod-hana-cluster",
      "health" => "passing",
      "nodes" => 4,
      "resources" => 12
    }
  end

  defp mock_tool_result("list_hosts", _args) do
    %{
      "hosts" => [
        %{"id" => "host-1", "hostname" => "hana-node-01", "health" => "passing"},
        %{"id" => "host-2", "hostname" => "hana-node-02", "health" => "passing"},
        %{"id" => "host-3", "hostname" => "hana-node-03", "health" => "critical"}
      ]
    }
  end

  defp mock_tool_result("get_host_details", %{"host_id" => host_id}) do
    %{
      "id" => host_id,
      "hostname" => "hana-node-01",
      "health" => "passing",
      "cpu_count" => 16,
      "memory_mb" => 65536
    }
  end

  defp mock_tool_result("list_sap_systems", _args) do
    %{
      "sap_systems" => [
        %{"id" => "sap-1", "sid" => "PRD", "type" => "HANA", "health" => "passing"},
        %{"id" => "sap-2", "sid" => "DEV", "type" => "HANA", "health" => "passing"}
      ]
    }
  end

  defp mock_tool_result("get_health_overview", _args) do
    %{
      "clusters" => %{"total" => 3, "passing" => 2, "warning" => 1, "critical" => 0},
      "hosts" => %{"total" => 12, "passing" => 10, "warning" => 1, "critical" => 1},
      "sap_systems" => %{"total" => 5, "passing" => 5, "warning" => 0, "critical" => 0}
    }
  end

  defp mock_tool_result(_tool_name, _args) do
    %{"error" => "Tool not implemented in mock"}
  end
end
