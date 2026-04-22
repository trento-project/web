defmodule TrentoWeb.AIAssistantTools do
  @moduledoc """
  AI Assistant tools for querying Trento infrastructure resources.
  """

  require Logger
  alias Trento.Clusters
  alias Trento.Clusters.Projections.ClusterReadModel
  alias Trento.Databases
  alias Trento.Databases.Projections.DatabaseReadModel
  alias Trento.Hosts
  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.Infrastructure.Prometheus
  alias Trento.SapSystems
  alias Trento.SapSystems.Projections.SapSystemReadModel
  alias Trento.Users

  alias TrentoWeb.{V1, V2}

  def tools do
    [
      host_list_tool(),
      sap_system_list_tool(),
      databases_list_tool(),
      clusters_list_tool(),
      instant_query_host_metrics_tool(),
      range_query_host_metrics_tool()
    ]
  end

  defp host_list_tool do
    AgenticRuntime.new_tool!(%{
      name: "Host_list",
      summary: "List hosts.",
      description:
        "Retrieves a comprehensive list of all hosts discovered on the target infrastructure, supporting monitoring and management tasks for administrators.",
      function: fn _args, context ->
        Logger.warning("user_id: #{inspect(context.current_scope)}")
        user = Users.get_user(context.current_scope.user.id)

        case Hosts.Policy.authorize(:list, user, HostReadModel) do
          true ->
            hosts = Hosts.get_all_hosts()

            Jason.encode!(V1.HostJSON.hosts(%{hosts: hosts}))

          _ ->
            "unauthorized"
        end
      end
    })
  end

  defp sap_system_list_tool do
    AgenticRuntime.new_tool!(%{
      name: "Sap_system_list",
      summary: "List SAP Systems.",
      description:
        "Retrieves a comprehensive list of all SAP Systems discovered on the target infrastructure, supporting monitoring and management tasks for administrators.",
      function: fn _args, context ->
        Logger.warning("user_id: #{inspect(context.current_scope)}")
        user = Users.get_user(context.current_scope.user.id)

        case SapSystems.Policy.authorize(:list, user, SapSystemReadModel) do
          true ->
            sap_systems = SapSystems.get_all_sap_systems()

            Jason.encode!(V1.SapSystemJSON.sap_systems(%{sap_systems: sap_systems}))

          _ ->
            "unauthorized"
        end
      end
    })
  end

  defp databases_list_tool do
    AgenticRuntime.new_tool!(%{
      name: "Database_list",
      summary: "List HANA Databases.",
      description:
        "Retrieves a comprehensive list of all HANA Databases discovered on the target infrastructure, supporting monitoring and management tasks for administrators.",
      function: fn _args, context ->
        Logger.warning("user_id: #{inspect(context.current_scope)}")
        user = Users.get_user(context.current_scope.user.id)

        case Databases.Policy.authorize(:list, user, DatabaseReadModel) do
          true ->
            databases = Databases.get_all_databases()

            Jason.encode!(V1.DatabaseJSON.databases(%{databases: databases}))

          _ ->
            "unauthorized"
        end
      end
    })
  end

  defp clusters_list_tool do
    AgenticRuntime.new_tool!(%{
      name: "Cluster_list",
      summary: "List Pacemaker Clusters.",
      description:
        "Retrieves a comprehensive list of all Pacemaker Clusters discovered on the target infrastructure, supporting monitoring and management tasks for administrators.",
      function: fn _args, context ->
        Logger.warning("user_id: #{inspect(context.current_scope)}")
        user = Users.get_user(context.current_scope.user.id)

        case Clusters.Policy.authorize(:list, user, ClusterReadModel) do
          true ->
            clusters = Clusters.get_all_clusters()

            Jason.encode!(V2.ClusterJSON.clusters(%{clusters: clusters}))

          _ ->
            "unauthorized"
        end
      end
    })
  end

  defp instant_query_host_metrics_tool do
    AgenticRuntime.new_tool!(%{
      name: "Instant_query_host_prometheus_metrics",
      summary: "Execute a PromQL query scoped to a host at a specific point in time.",
      description:
        "Executes an arbitrary PromQL query against Prometheus, automatically injecting the host's agentID label into all vector selectors to scope results to the specified host. " <>
          "Supports only instant queries.",
      parameters_schema: %{
        type: "object",
        properties: %{
          host_id: %{
            type: "string",
            format: :uuid,
            description:
              "Unique identifier of the host to scope the query to. This value must be a valid UUID string.",
            example: "d59523fc-0497-4b1e-9fdd-14aa7cda77f1"
          },
          query: %{
            description:
              "A PromQL query expression. The host's agentID label will be automatically injected into all vector selectors.",
            type: :string,
            example: "node_memory_MemTotal_bytes"
          },
          time: %{
            description:
              "Evaluation timestamp for instant queries. If not provided, the current UTC time will be used.",
            type: :string,
            format: :"date-time",
            example: "2024-01-15T10:00:00Z"
          }
        },
        required: ["host_id", "query"]
      },
      function: fn %{"host_id" => host_id, "query" => query} = args, context ->
        Logger.warning("user_id: #{inspect(context.current_scope)}")
        user = Users.get_user(context.current_scope.user.id)

        case Hosts.Policy.authorize(:query_metrics, user, HostReadModel) do
          true ->
            time = Map.get(args, :time, DateTime.utc_now())
            result = Prometheus.query(host_id, query, time)

            case result do
              {:ok, %{"data" => %{"result" => query_results}}} ->
                Jason.encode!(query_results)

              {:error, reason} ->
                Logger.warning(inspect(reason))
                "Prometheus query failed"
            end

          _ ->
            "unauthorized"
        end
      end
    })
  end

  defp range_query_host_metrics_tool do
    AgenticRuntime.new_tool!(%{
      name: "Range_query_host_prometheus_metrics",
      summary: "Execute a PromQL query scoped to a host over a specified time period.",
      description:
        "Executes an arbitrary PromQL query against Prometheus, automatically injecting the host's agentID label into all vector selectors to scope results to the specified host. " <>
          "Supports only range queries ('from' and 'to' must be provided).",
      parameters_schema: %{
        type: "object",
        properties: %{
          host_id: %{
            type: "string",
            format: :uuid,
            description:
              "Unique identifier of the host to scope the query to. This value must be a valid UUID string.",
            example: "d59523fc-0497-4b1e-9fdd-14aa7cda77f1"
          },
          query: %{
            description:
              "A PromQL query expression. The host's agentID label will be automatically injected into all vector selectors.",
            type: :string,
            example: "node_memory_MemTotal_bytes"
          },
          from: %{
            description:
              "Start of the time range for range queries. When both 'from' and 'to' are provided, a range query is executed instead of an instant query.",
            type: :string,
            format: :"date-time",
            example: "2024-01-15T10:00:00Z"
          },
          to: %{
            description:
              "End of the time range for range queries. Must be provided together with 'from'.",
            type: :string,
            format: :"date-time",
            example: "2024-01-15T12:00:00Z"
          }
        },
        required: ["host_id", "query", "from", "to"]
      },
      function: fn args, context ->
        Logger.warning("user_id: #{inspect(context.current_scope)}")
        user = Users.get_user(context.current_scope.user.id)

        case Hosts.Policy.authorize(:query_metrics, user, HostReadModel) do
          true ->
            host_id = Map.get(args, "host_id")
            query = Map.get(args, "query")
            from = Map.get(args, "from")
            to = Map.get(args, "to")
            result = Prometheus.query_range(host_id, query, from, to)

            case result do
              {:ok, %{"data" => %{"result" => query_results}}} ->
                Jason.encode!(query_results)

              {:error, reason} ->
                Logger.warning(inspect(reason))
                "Prometheus query failed"
            end

          _ ->
            "unauthorized"
        end
      end
    })
  end
end
