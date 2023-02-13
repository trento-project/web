defmodule TrentoWeb.V1.ClusterController do
  use TrentoWeb, :controller

  alias Trento.Clusters

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
end
