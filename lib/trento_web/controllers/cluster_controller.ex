defmodule TrentoWeb.ClusterController do
  use TrentoWeb, :controller

  alias Trento.{Clusters, Hosts}

  alias Trento.Integration.Checks

  alias TrentoWeb.OpenApi.Schema

  use OpenApiSpex.ControllerSpecs

  @cluster_id_schema [
    in: :path,
    required: true,
    type: %OpenApiSpex.Schema{type: :string, format: :uuid}
  ]

  action_fallback TrentoWeb.FallbackController

  operation :list,
    summary: "List Pacemaker Clusters",
    tags: ["Target Infrastructure"],
    description: "List all the discovered Pacemaker Clusters on the target infrastructure",
    responses: [
      ok:
        {"A collection of the discovered Pacemaker Clusters", "application/json",
         Schema.Cluster.PacemakerClustersCollection}
    ]

  @spec list(Plug.Conn.t(), map) :: Plug.Conn.t()
  def list(conn, _) do
    clusters = Clusters.get_all_clusters()

    render(conn, "clusters.json", clusters: clusters)
  end

  operation :request_checks_execution,
    summary: "Request Checks Execution for a Cluster",
    tags: ["Checks"],
    description: "Trigger execution of the latest Checks Selection on the target infrastructure",
    parameters: [
      cluster_id: @cluster_id_schema
    ],
    responses: [
      accepted:
        {"The Command has been accepted and the Requested execution is scheduled",
         "application/json", Schema.Common.EmptyResponse},
      bad_request:
        {"Something went wrong while triggering an Execution Request", "application/json",
         Schema.Common.BadRequestResponse}
    ]

  @spec request_checks_execution(Plug.Conn.t(), map) :: Plug.Conn.t()
  def request_checks_execution(conn, %{"cluster_id" => cluster_id}) do
    case Clusters.request_checks_execution(cluster_id) do
      :ok ->
        conn
        |> put_status(:accepted)
        |> json(%{})

      {:error, reason} ->
        {:error, {:bad_request, reason}}
    end
  end

  operation :runner_callback,
    summary: "Hook for Checks Execution progress updates",
    tags: ["Checks"],
    description:
      "The Runner executing the Checks Selection on the target infrastructure, publishes updates about the progress of the Execution.",
    request_body: {"Callback Event", "application/json", Schema.Runner.CallbackEvent},
    responses: [
      accepted:
        {"The Operation has been accepted, and the proper followup processes will trigger",
         "application/json", Schema.Common.EmptyResponse},
      bad_request:
        {"Something went wrong during the operation", "application/json",
         Schema.Common.BadRequestResponse}
    ]

  @spec runner_callback(Plug.Conn.t(), map) :: Plug.Conn.t()
  def runner_callback(conn, params) do
    case Checks.handle_callback(params) do
      :ok ->
        conn
        |> put_status(:accepted)
        |> json(%{})

      {:error, _} ->
        {:error, {:bad_request, "runner callback failed"}}
    end
  end

  operation :select_checks,
    summary: "Select Checks",
    tags: ["Checks"],
    description: "Select the Checks eligible for execution on the target infrastructure",
    parameters: [
      cluster_id: @cluster_id_schema
    ],
    request_body: {"Checks Selection", "application/json", Schema.Checks.ChecksSelectionRequest},
    responses: [
      accepted:
        {"The Selection has been successfully collected", "application/json",
         Schema.Common.EmptyResponse},
      bad_request:
        {"Something went wrong with the collection of the Checks Selection", "application/json",
         Schema.Common.BadRequestResponse}
    ]

  @spec select_checks(Plug.Conn.t(), map) :: Plug.Conn.t()
  def select_checks(conn, %{"cluster_id" => cluster_id, "checks" => checks}) do
    case Clusters.select_checks(cluster_id, checks) do
      :ok ->
        conn
        |> put_status(:accepted)
        |> json(%{})

      {:error, reason} ->
        {:error, {:bad_request, reason}}
    end
  end

  operation :get_connection_settings, false
  @spec get_connection_settings(Plug.Conn.t(), map) :: Plug.Conn.t()
  def get_connection_settings(conn, %{"cluster_id" => cluster_id}) do
    settings = Hosts.get_all_connection_settings_by_cluster_id(cluster_id)

    conn
    |> put_status(:ok)
    |> render("settings.json", settings: settings)
  end

  operation :save_connection_settings, false
  @spec save_connection_settings(Plug.Conn.t(), map) :: Plug.Conn.t()
  def save_connection_settings(
        conn,
        %{
          "settings" => [_ | _] = settings,
          "cluster_id" => cluster_id
        }
      ) do
    settings
    |> Enum.map(&map_to_struct/1)
    |> Hosts.save_hosts_connection_settings()

    get_connection_settings(conn, %{"cluster_id" => cluster_id})
  end

  defp map_to_struct(%{"host_id" => host_id, "user" => user}) do
    %{host_id: host_id, user: user}
  end
end
