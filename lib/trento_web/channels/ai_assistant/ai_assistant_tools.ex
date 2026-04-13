defmodule TrentoWeb.AIAssistantTools do
  require Logger
  alias Trento.Hosts
  alias Trento.SapSystems
  alias Trento.Databases
  alias Trento.Clusters
  alias TrentoWeb.V1
  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.SapSystems.Projections.SapSystemReadModel
  alias Trento.Databases.Projections.DatabaseReadModel
  alias Trento.Clusters.Projections.ClusterReadModel
  alias Trento.Users

  def tools do
    [
      host_list_tool(),
      sap_system_list_tool()
    ]
  end

  def host_list_tool() do
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

            V1.HostJSON.hosts(%{hosts: hosts})
            |> Jason.encode!()

          _ ->
            "unauthorized"
        end
      end
    })
  end

  def sap_system_list_tool() do
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

            V1.SapSystemJSON.sap_systems(%{sap_systems: sap_systems})
            |> Jason.encode!()

          _ ->
            "unauthorized"
        end
      end
    })
  end

  def databases_list_tool() do
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

            V1.DatabaseJSON.databases(%{databases: databases})
            |> Jason.encode!()

          _ ->
            "unauthorized"
        end
      end
    })
  end

  def clusters_list_tool() do
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

            V1.DatabaseJSON.databases(%{clusters: clusters})
            |> Jason.encode!()

          _ ->
            "unauthorized"
        end
      end
    })
  end
end
