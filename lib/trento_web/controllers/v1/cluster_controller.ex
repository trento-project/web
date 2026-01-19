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
    Forbidden,
    NotFound,
    OperationAccepted,
    UnprocessableEntity
  }

  alias TrentoWeb.OpenApi.V1.Schema.Operations.{
    ClusterMaintenanceChangeParams,
    ClusterResourceRefreshParams
  }

  require Trento.Operations.Enums.ClusterOperations, as: ClusterOperations
  require Trento.Operations.Enums.ClusterHostOperations, as: ClusterHostOperations

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
         operation: &Phoenix.Controller.action_name/1,
         assigns_to: :cluster,
         params: &__MODULE__.get_operation_params/1
       ]
       when action in ClusterOperations.values() or action in ClusterHostOperations.values()

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

  @operations [
    %{
      operation: ClusterOperations.cluster_maintenance_change(),
      summary: "Request cluster maintenance change operation",
      description:
        "Request cluster maintenance change operation on a cluster to change maintenance state of the whole cluster or specifics resource/nodes.",
      request_body: ClusterMaintenanceChangeParams
    },
    %{
      operation: ClusterOperations.cluster_resource_refresh(),
      summary: "Request cluster resource refresh operation",
      description:
        "Request cluster resource refresh operation on a cluster to refresh specific or all the resources in the cluster.",
      request_body: ClusterResourceRefreshParams
    }
  ]

  for %{
        operation: cluster_operation,
        summary: summary,
        description: description,
        request_body: request_body
      } <- @operations do
    @op cluster_operation

    operation @op,
      summary: summary,
      tags: ["Operations"],
      description: description,
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
        ]
      ],
      request_body:
        request_body &&
          {"Request containing parameters for the specified cluster operation.",
           "application/json", request_body},
      responses: [
        accepted: OperationAccepted.response(),
        not_found: NotFound.response(),
        forbidden: Forbidden.response(),
        unprocessable_entity: UnprocessableEntity.response()
      ]

    def unquote(cluster_operation)(conn, params) do
      request_operation(conn, params)
    end
  end

  @host_operations [
    %{
      operation: ClusterHostOperations.pacemaker_enable(),
      summary: "Request pacemaker enable operation",
      description:
        "Request cluster maintenance change operation on a cluster to change maintenance state of the whole cluster or specifics resource/nodes.",
      request_body: nil
    },
    %{
      operation: ClusterHostOperations.pacemaker_disable(),
      summary: "Request pacemaker disable operation",
      description:
        "Request cluster resource refresh operation on a cluster to refresh specific or all the resources in the cluster.",
      request_body: nil
    },
    %{
      operation: ClusterHostOperations.cluster_host_start(),
      summary: "Request cluster start in host operation",
      description:
        "Request cluster start in host operation to start all cluster components such us Pacemaker and Corosync.",
      request_body: nil
    },
    %{
      operation: ClusterHostOperations.cluster_host_stop(),
      summary: "Request cluster stop in host operation",
      description:
        "Request cluster stop in host operation to stop all cluster components such us Pacemaker and Corosync.",
      request_body: nil
    }
  ]

  for %{
        operation: cluster_host_operation,
        summary: summary,
        description: description,
        request_body: request_body
      } <- @host_operations do
    @host_op cluster_host_operation

    operation @host_op,
      summary: summary,
      tags: ["Operations"],
      description: description,
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
        ]
      ],
      request_body:
        request_body &&
          {"Request containing parameters for the specified cluster host operation.",
           "application/json", request_body},
      responses: [
        accepted: OperationAccepted.response(),
        not_found: NotFound.response(),
        forbidden: Forbidden.response(),
        unprocessable_entity: UnprocessableEntity.response()
      ]

    def unquote(cluster_host_operation)(conn, params) do
      request_host_operation(conn, params)
    end
  end

  def get_policy_resource(_), do: ClusterReadModel

  def get_operation_cluster(%{
        assigns: %{operation: operation},
        params: %{id: id}
      })
      when operation in ClusterOperations.values() do
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
    |> Repo.preload(hosts: [:database_instances])
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

  def get_operation_params(%{assigns: %{operation: operation}, params: %{host_id: host_id}})
      when operation in ClusterHostOperations.values() do
    %{
      host_id: host_id
    }
  end

  def get_operation_params(_), do: %{}

  defp request_operation(%{assigns: %{cluster: cluster, operation: operation}} = conn, _) do
    %{id: cluster_id} = cluster
    params = OpenApiSpex.body_params(conn)

    with {:ok, operation_id} <- Clusters.request_operation(operation, cluster_id, params) do
      conn
      |> put_status(:accepted)
      |> json(%{operation_id: operation_id})
    end
  end

  defp request_host_operation(
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
end
