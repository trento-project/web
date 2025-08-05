defmodule TrentoWeb.V1.HostController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.Repo

  alias Trento.{
    Heartbeats,
    Hosts
  }

  alias Trento.Hosts.Projections.HostReadModel

  alias TrentoWeb.OpenApi.V1.Schema

  alias TrentoWeb.OpenApi.V1.Schema.{
    BadRequest,
    Forbidden,
    HostOperationParams,
    NotFound,
    OperationAccepted,
    UnprocessableEntity
  }

  require Logger

  plug TrentoWeb.Plugs.LoadUserPlug when action not in [:heartbeat]

  plug Bodyguard.Plug.Authorize,
    policy: Trento.Hosts.Policy,
    action: {Phoenix.Controller, :action_name},
    user: {Pow.Plug, :current_user},
    params: {__MODULE__, :get_policy_resource},
    fallback: TrentoWeb.FallbackController

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true

  plug TrentoWeb.Plugs.OperationsPolicyPlug,
       [
         policy: Trento.Operations.HostPolicy,
         resource: &__MODULE__.get_operation_host/1,
         operation: &__MODULE__.get_operation/1,
         assigns_to: :host
       ]
       when action == :request_operation

  action_fallback TrentoWeb.FallbackController

  operation :list,
    tags: ["Target Infrastructure"],
    summary: "List hosts.",
    description:
      "Retrieves a comprehensive list of all hosts discovered on the target infrastructure, supporting monitoring and management tasks for administrators.",
    responses: [
      ok:
        {"Comprehensive list of all hosts discovered on the target infrastructure for monitoring and management.",
         "application/json", Schema.Host.HostsCollection}
    ]

  @spec list(Plug.Conn.t(), map) :: Plug.Conn.t()
  def list(conn, _) do
    hosts = Hosts.get_all_hosts()
    render(conn, :hosts, hosts: hosts)
  end

  operation :delete,
    summary: "Deregister a host.",
    description:
      "Removes a host agent from Trento, supporting infrastructure cleanup and resource management for administrators.",
    tags: ["Target Infrastructure"],
    parameters: [
      id: [
        in: :path,
        description:
          "Unique identifier of the host to be deregistered. This value must be a valid UUID string.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "d59523fc-0497-4b1e-9fdd-14aa7cda77f1"
        }
      ]
    ],
    responses: [
      no_content: "The host has been deregistered.",
      not_found: NotFound.response(),
      unprocessable_entity: UnprocessableEntity.response()
    ]

  @spec delete(Plug.Conn.t(), map) :: Plug.Conn.t()
  def delete(conn, %{id: host_id}) do
    case Hosts.deregister_host(host_id) do
      :ok -> send_resp(conn, 204, "")
      {:error, error} -> {:error, error}
    end
  end

  operation :heartbeat,
    summary: "Signal that an agent is alive.",
    tags: ["Agent"],
    description:
      "Allows agents to signal their active status to Trento, supporting health monitoring and availability tracking for infrastructure management.",
    parameters: [
      id: [
        in: :path,
        description:
          "Unique identifier of the host agent sending the heartbeat signal. This value must be a valid UUID string.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "d59523fc-0497-4b1e-9fdd-14aa7cda77f1"
        }
      ]
    ],
    responses: [
      no_content:
        {"Heartbeat signal successfully updated for the host agent, supporting health monitoring and availability tracking.",
         "application/json",
         %OpenApiSpex.Schema{
           type: :object,
           properties: %{},
           example: %{}
         }},
      not_found: NotFound.response(),
      bad_request: BadRequest.response(),
      unprocessable_entity: UnprocessableEntity.response()
    ]

  def heartbeat(conn, %{id: id}) do
    with :ok <- Heartbeats.heartbeat(id) do
      send_resp(conn, 204, "")
    end
  end

  operation :select_checks,
    summary: "Select Checks for a Host.",
    tags: ["Checks"],
    description:
      "Allows users to select which Checks are eligible for execution on a specific host within the target infrastructure, supporting custom validation workflows.",
    parameters: [
      id: [
        in: :path,
        description:
          "Unique identifier of the host for which Checks selection is being performed. This value must be a valid UUID string.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "d59523fc-0497-4b1e-9fdd-14aa7cda77f1"
        }
      ]
    ],
    request_body: {"Checks Selection.", "application/json", Schema.Checks.ChecksSelectionRequest},
    responses: [
      accepted:
        {"Selected checks for the host have been successfully collected and are ready for execution.",
         "application/json",
         %OpenApiSpex.Schema{
           type: :object,
           properties: %{},
           example: %{}
         }},
      not_found: NotFound.response(),
      unprocessable_entity: UnprocessableEntity.response()
    ]

  def select_checks(conn, %{id: host_id}) do
    %{checks: checks} = OpenApiSpex.body_params(conn)

    with :ok <- Hosts.select_checks(host_id, checks) do
      conn
      |> put_status(:accepted)
      |> json(%{})
    end
  end

  operation :request_checks_execution,
    summary: "Request Checks Execution for a Host.",
    tags: ["Checks"],
    description:
      "Initiates the execution of the most recently selected Checks for a specified host on the target infrastructure, enabling automated validation and compliance assessment.",
    parameters: [
      id: [
        in: :path,
        description:
          "Unique identifier of the host for which the Checks execution is being requested. This value must be a valid UUID string.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "d59523fc-0497-4b1e-9fdd-14aa7cda77f1"
        }
      ]
    ],
    responses: [
      accepted:
        "Checks execution request for the specified host has been accepted and scheduled for processing.",
      not_found: NotFound.response(),
      unprocessable_entity: UnprocessableEntity.response()
    ]

  def request_checks_execution(conn, %{id: host_id}) do
    with :ok <- Hosts.request_checks_execution(host_id) do
      conn
      |> put_status(:accepted)
      |> json(%{})
    end
  end

  operation :request_operation,
    summary: "Request operation for a Host.",
    tags: ["Operations"],
    description:
      "Submits a request to perform a specific operation on a host, such as restart or configuration change, supporting automated infrastructure management.",
    parameters: [
      id: [
        in: :path,
        description:
          "Unique identifier of the host on which the operation will be performed. This value must be a valid UUID string.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "d59523fc-0497-4b1e-9fdd-14aa7cda77f1"
        }
      ],
      operation: [
        in: :path,
        description:
          "Specifies the type of operation to be performed on the host, such as restart or configuration change.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          example: "restart"
        }
      ]
    ],
    request_body:
      {"Request containing parameters for the specified host operation.", "application/json",
       HostOperationParams},
    responses: [
      accepted: OperationAccepted.response(),
      not_found: NotFound.response(),
      forbidden: Forbidden.response(),
      unprocessable_entity: UnprocessableEntity.response()
    ]

  def request_operation(%{assigns: %{host: host, operation: operation}} = conn, _)
      when operation in [:saptune_solution_apply, :saptune_solution_change] do
    %{id: host_id} = host
    %{solution: solution} = OpenApiSpex.body_params(conn)

    with {:ok, operation_id} <- Hosts.request_operation(operation, host_id, %{solution: solution}) do
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

  def get_policy_resource(_), do: HostReadModel

  def get_operation_host(%{params: %{id: id}}) do
    HostReadModel
    |> Repo.get(id)
    |> Repo.preload([:cluster, :application_instances, :database_instances])
  end

  def get_operation(%{params: %{operation: "saptune_solution_apply"}}),
    do: :saptune_solution_apply

  def get_operation(%{params: %{operation: "saptune_solution_change"}}),
    do: :saptune_solution_change

  def get_operation(_), do: nil
end
