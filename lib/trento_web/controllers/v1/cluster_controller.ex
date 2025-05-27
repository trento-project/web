defmodule TrentoWeb.V1.ClusterController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.Repo

  alias Trento.Clusters

  alias Trento.Clusters.Projections.ClusterReadModel

  alias TrentoWeb.OpenApi.V1.Schema.{
    BadRequest,
    Checks,
    Cluster,
    ClusterOperationParams,
    Forbidden,
    NotFound,
    OperationAccepted
  }

  plug TrentoWeb.Plugs.LoadUserPlug

  plug Bodyguard.Plug.Authorize,
    policy: Trento.Clusters.Policy,
    action: {Phoenix.Controller, :action_name},
    user: {Pow.Plug, :current_user},
    params: {__MODULE__, :get_policy_resource},
    fallback: TrentoWeb.FallbackController

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true

  plug TrentoWeb.Plugs.OperationsPolicyPlug,
       [
         policy: Trento.Operations.ClusterPolicy,
         resource: &__MODULE__.get_operation_cluster/1,
         operation: &__MODULE__.get_operation/1,
         assigns_to: :cluster
       ]
       when action == :request_operation

  action_fallback TrentoWeb.FallbackController

  operation :list,
    summary: "List Pacemaker Clusters",
    tags: ["Target Infrastructure"],
    description: "List all the discovered Pacemaker Clusters on the target infrastructure",
    responses: [
      ok:
        {"A collection of the discovered Pacemaker Clusters", "application/json",
         Cluster.PacemakerClustersCollection}
    ]

  def list(conn, _) do
    clusters = Clusters.get_all_clusters()

    render(conn, :clusters, clusters: clusters)
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
      accepted: "The Command has been accepted and the Requested Cluster execution is scheduled",
      not_found: NotFound.response(),
      bad_request: BadRequest.response(),
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
    summary: "Select Checks for a Cluster",
    tags: ["Checks"],
    description: "Select the Checks eligible for execution on the target infrastructure",
    parameters: [
      cluster_id: [
        in: :path,
        required: true,
        type: %OpenApiSpex.Schema{type: :string, format: :uuid}
      ]
    ],
    request_body: {"Checks Selection", "application/json", Checks.ChecksSelectionRequest},
    responses: [
      accepted: "The Selection has been successfully collected",
      not_found: NotFound.response(),
      bad_request: BadRequest.response(),
      unprocessable_entity: OpenApiSpex.JsonErrorResponse.response()
    ]

  def select_checks(conn, %{cluster_id: cluster_id}) do
    %{checks: checks} = OpenApiSpex.body_params(conn)

    with :ok <- Clusters.select_checks(cluster_id, checks) do
      conn
      |> put_status(:accepted)
      |> json(%{})
    end
  end

  operation :request_operation,
    summary: "Request operation for a Cluster",
    tags: ["Operations"],
    description: "Request operation for a Cluster",
    parameters: [
      id: [
        in: :path,
        required: true,
        type: %OpenApiSpex.Schema{type: :string, format: :uuid}
      ],
      operation: [
        in: :path,
        required: true,
        type: %OpenApiSpex.Schema{type: :string}
      ]
    ],
    request_body: {"Params", "application/json", ClusterOperationParams},
    responses: [
      accepted: OperationAccepted.response(),
      not_found: NotFound.response(),
      forbidden: Forbidden.response(),
      unprocessable_entity: OpenApiSpex.JsonErrorResponse.response()
    ]

  def request_operation(%{assigns: %{cluster: cluster, operation: operation}} = conn, _) do
    %{id: cluster_id} = cluster
    params = OpenApiSpex.body_params(conn)

    with {:ok, operation_id} <- Clusters.request_operation(operation, cluster_id, params) do
      conn
      |> put_status(:accepted)
      |> json(%{operation_id: operation_id})
    end
  end

  def get_policy_resource(%{
        private: %{phoenix_action: :request_operation},
        path_params: %{"operation" => operation}
      }),
      do: %{operation: operation}

  def get_policy_resource(_), do: ClusterReadModel

  def get_operation_cluster(%{params: %{id: id}}) do
    Repo.get(ClusterReadModel, id)
  end

  def get_operation(%{params: %{operation: "cluster_maintenance_change"}}),
    do: :cluster_maintenance_change

  def get_operation(_), do: nil
end
