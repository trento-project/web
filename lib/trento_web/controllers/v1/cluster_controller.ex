defmodule TrentoWeb.V1.ClusterController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.Clusters

  alias TrentoWeb.OpenApi.V1.Schema

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
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

  def list(conn, _) do
    clusters = Clusters.get_all_clusters()

    render(conn, "clusters.json", clusters: clusters)
  end

  operation :request_checks_execution,
    summary: "Request Checks Execution for a Cluster",
    tags: ["Checks"],
    description: "Trigger execution of the latest Checks Selection on the target infrastructure",
    parameters: [
      cluster_id: [
        in: :path,
        required: true,
        type: %OpenApiSpex.Schema{type: :string, format: :uuid}
      ]
    ],
    responses: [
      accepted: "The Command has been accepted and the Requested execution is scheduled",
      not_found: Schema.NotFound.response(),
      bad_request: Schema.BadRequest.response(),
      unprocessable_entity: OpenApiSpex.JsonErrorResponse.response()
    ]

  def request_checks_execution(conn, %{cluster_id: cluster_id}) do
    with :ok <- Clusters.request_checks_execution(cluster_id) do
      conn
      |> put_status(:accepted)
      |> json(%{})
    end
  end

  operation :select_checks,
    summary: "Select Checks",
    tags: ["Checks"],
    description: "Select the Checks eligible for execution on the target infrastructure",
    parameters: [
      cluster_id: [
        in: :path,
        required: true,
        type: %OpenApiSpex.Schema{type: :string, format: :uuid}
      ]
    ],
    request_body: {"Checks Selection", "application/json", Schema.Checks.ChecksSelectionRequest},
    responses: [
      accepted: "The Selection has been successfully collected",
      not_found: Schema.NotFound.response(),
      bad_request: Schema.BadRequest.response(),
      unprocessable_entity: OpenApiSpex.JsonErrorResponse.response()
    ]

  def select_checks(%{body_params: body_params} = conn, %{cluster_id: cluster_id}) do
    %{checks: checks} = body_params

    with :ok <- Clusters.select_checks(cluster_id, checks) do
      conn
      |> put_status(:accepted)
      |> json(%{})
    end
  end
end
