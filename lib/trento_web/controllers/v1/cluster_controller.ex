defmodule TrentoWeb.V1.ClusterController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.Clusters

  alias Trento.Clusters.Projections.ClusterReadModel

  alias Trento.Repo

  alias TrentoWeb.OpenApi.V1.Schema.{
    BadRequest,
    Checks,
    Cluster,
    ClusterOperationParams,
    Forbidden,
    NotFound,
    OperationAccepted,
    UnprocessableEntity
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
         assigns_to: :cluster,
         params: &__MODULE__.get_operation_params/1
       ]
       when action in [:request_operation, :request_host_operation]

  action_fallback TrentoWeb.FallbackController

  operation :list,
    summary: "List Pacemaker Clusters.",
    deprecated: true,
    tags: ["Target Infrastructure", "MCP"],
    description:
      "Retrieves a comprehensive list of all Pacemaker Clusters discovered on the target infrastructure, supporting monitoring and management tasks for administrators.",
    responses: [
      ok:
        {"Comprehensive list of all Pacemaker Clusters discovered on the target infrastructure for monitoring and management.",
         "application/json", Cluster.PacemakerClustersCollection}
    ]

  def list(conn, _) do
    clusters = Clusters.get_all_clusters()

    render(conn, :clusters, clusters: clusters)
  end

  operation :request_checks_execution,
    summary: "Request Checks Execution for a Cluster.",
    tags: ["Checks", "MCP"],
    description:
      "Initiates the execution of the most recently selected Checks for a specified cluster on the target infrastructure, enabling automated validation and compliance assessment.",
    parameters: [
      cluster_id: [
        in: :path,
        description:
          "Unique identifier of the cluster for which the Checks execution is being requested. This value must be a valid UUID string.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "c1a2b3c4-d5e6-7890-abcd-ef1234567890"
        }
      ]
    ],
    responses: [
      accepted:
        "Checks execution request for the specified cluster has been accepted and scheduled for processing.",
      not_found: NotFound.response(),
      bad_request: BadRequest.response(),
      unprocessable_entity: UnprocessableEntity.response()
    ]

  def request_checks_execution(conn, %{cluster_id: cluster_id}) do
    with :ok <- Clusters.request_checks_execution(cluster_id) do
      conn
      |> put_status(:accepted)
      |> json(%{})
    end
  end

  operation :select_checks,
    summary: "Select Checks for a Cluster.",
    tags: ["Checks"],
    description:
      "Allows users to select which Checks are eligible for execution on a specific cluster within the target infrastructure, supporting custom validation workflows.",
    parameters: [
      cluster_id: [
        in: :path,
        description:
          "Unique identifier of the cluster for which Checks selection is being performed. This value must be a valid UUID string.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "c1a2b3c4-d5e6-7890-abcd-ef1234567890"
        }
      ]
    ],
    request_body: {"Checks Selection.", "application/json", Checks.ChecksSelectionRequest},
    responses: [
      accepted: "The Selection has been successfully collected.",
      not_found: NotFound.response(),
      bad_request: BadRequest.response(),
      unprocessable_entity: UnprocessableEntity.response()
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
    summary: "Request operation for a Cluster.",
    tags: ["Operations"],
    description:
      "Submits a request to perform a specific operation on a cluster, such as maintenance or configuration changes, supporting automated infrastructure management.",
    parameters: [
      id: [
        in: :path,
        description:
          "Unique identifier of the cluster on which the operation will be performed. This value must be a valid UUID string.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "c1a2b3c4-d5e6-7890-abcd-ef1234567890"
        }
      ],
      operation: [
        in: :path,
        description:
          "Specifies the type of operation to be performed on the cluster, such as maintenance or configuration change.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          example: "cluster_maintenance_change"
        }
      ]
    ],
    request_body:
      {"Request containing parameters for the specified cluster operation.", "application/json",
       ClusterOperationParams},
    responses: [
      accepted: OperationAccepted.response(),
      not_found: NotFound.response(),
      forbidden: Forbidden.response(),
      unprocessable_entity: UnprocessableEntity.response()
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

  operation :request_host_operation,
    summary: "Request operation for a Cluster host.",
    tags: ["Operations"],
    description:
      "Submits a request to perform a specific operation on a host within a cluster, supporting targeted maintenance or configuration changes for individual hosts.",
    parameters: [
      id: [
        in: :path,
        required: true,
        description:
          "Unique identifier of the cluster containing the host. This value must be a valid UUID string.",
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "c1a2b3c4-d5e6-7890-abcd-ef1234567890"
        }
      ],
      host_id: [
        in: :path,
        required: true,
        description:
          "Unique identifier of the host within the cluster on which the operation will be performed. This value must be a valid UUID string.",
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "d59523fc-0497-4b1e-9fdd-14aa7cda77f1"
        }
      ],
      operation: [
        in: :path,
        required: true,
        description:
          "Specifies the type of operation to be performed on the cluster's host, such as enabling or disabling pacemaker services.",
        schema: %OpenApiSpex.Schema{
          type: :string,
          example: "pacemaker_enable"
        }
      ]
    ],
    responses: [
      accepted: OperationAccepted.response(),
      not_found: NotFound.response(),
      forbidden: Forbidden.response(),
      unprocessable_entity: UnprocessableEntity.response()
    ]

  def request_host_operation(
        %{assigns: %{cluster: %{id: cluster_id}, operation: operation}} = conn,
        %{
          id: cluster_id,
          host_id: host_id
        }
      ) do
    with {:ok, operation_id} <-
           Clusters.request_host_operation(operation, cluster_id, host_id) do
      conn
      |> put_status(:accepted)
      |> json(%{operation_id: operation_id})
    end
  end

  def get_policy_resource(%{
        private: %{phoenix_action: action},
        path_params: %{"operation" => operation}
      })
      when action in [:request_operation, :request_host_operation],
      do: %{operation: operation}

  def get_policy_resource(_), do: ClusterReadModel

  def get_operation_cluster(%{
        assigns: %{operation: :cluster_maintenance_change},
        params: %{id: id}
      }) do
    id
    |> Clusters.get_cluster_by_id()
    |> Repo.preload(:hosts)
  end

  def get_operation_cluster(%{
        assigns: %{operation: _},
        params: %{id: id, host_id: host_id}
      }) do
    id
    |> Clusters.get_cluster_by_id()
    |> Repo.preload(:hosts)
    |> case do
      nil ->
        nil

      %ClusterReadModel{hosts: []} ->
        nil

      %ClusterReadModel{hosts: hosts} = cluster ->
        case Enum.any?(hosts, &(&1.id == host_id)) do
          true -> cluster
          false -> nil
        end
    end
  end

  def get_operation_cluster(_), do: nil

  def get_operation(%{params: %{operation: "cluster_maintenance_change"}}),
    do: :cluster_maintenance_change

  def get_operation(%{params: %{operation: "pacemaker_enable"}}),
    do: :pacemaker_enable

  def get_operation(%{params: %{operation: "pacemaker_disable"}}),
    do: :pacemaker_disable

  def get_operation(%{params: %{operation: "cluster_host_start"}}),
    do: :cluster_host_start

  def get_operation(%{params: %{operation: "cluster_host_stop"}}),
    do: :cluster_host_stop

  def get_operation(_), do: nil

  def get_operation_params(%{assigns: %{operation: operation}, params: %{host_id: host_id}})
      when operation in [:pacemaker_enable, :pacemaker_disable] do
    %{
      host_id: host_id
    }
  end

  def get_operation_params(_), do: %{}
end
