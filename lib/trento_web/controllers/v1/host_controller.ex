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
    NotFound,
    OperationAccepted,
    OperationParams,
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
    summary: "List hosts",
    description: "List all the discovered hosts on the target infrastructure",
    responses: [
      ok:
        {"A collection of the discovered hosts", "application/json", Schema.Host.HostsCollection}
    ]

  @spec list(Plug.Conn.t(), map) :: Plug.Conn.t()
  def list(conn, _) do
    hosts = Hosts.get_all_hosts()
    render(conn, :hosts, hosts: hosts)
  end

  operation :delete,
    summary: "Deregister a host",
    description: "Deregister a host agent from Trento",
    parameters: [
      id: [
        in: :path,
        required: true,
        type: %OpenApiSpex.Schema{type: :string, format: :uuid}
      ]
    ],
    responses: [
      no_content: "The host has been deregistered",
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
    summary: "Signal that an agent is alive",
    tags: ["Agent"],
    description: "This is used by the agents to signal that they are still alive.",
    parameters: [
      id: [
        in: :path,
        required: true,
        type: %OpenApiSpex.Schema{type: :string, format: :uuid}
      ]
    ],
    responses: [
      no_content: "The heartbeat has been updated",
      not_found: NotFound.response(),
      bad_request: BadRequest.response(),
      unprocessable_entity: OpenApiSpex.JsonErrorResponse.response()
    ]

  def heartbeat(conn, %{id: id}) do
    with :ok <- Heartbeats.heartbeat(id) do
      send_resp(conn, 204, "")
    end
  end

  operation :select_checks,
    summary: "Select Checks for a Host",
    tags: ["Checks"],
    description: "Select the Checks eligible for execution on the target infrastructure",
    parameters: [
      id: [
        in: :path,
        required: true,
        type: %OpenApiSpex.Schema{type: :string, format: :uuid}
      ]
    ],
    request_body: {"Checks Selection", "application/json", Schema.Checks.ChecksSelectionRequest},
    responses: [
      accepted: "The Selection has been successfully collected",
      not_found: NotFound.response(),
      unprocessable_entity: OpenApiSpex.JsonErrorResponse.response()
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
    summary: "Request Checks Execution for a Host",
    tags: ["Checks"],
    description: "Trigger execution of the latest Checks Selection on the target infrastructure",
    parameters: [
      id: [
        in: :path,
        required: true,
        type: %OpenApiSpex.Schema{type: :string, format: :uuid}
      ]
    ],
    responses: [
      accepted: "The Command has been accepted and the Requested Host execution is scheduled",
      not_found: NotFound.response(),
      unprocessable_entity: OpenApiSpex.JsonErrorResponse.response()
    ]

  def request_checks_execution(conn, %{id: host_id}) do
    with :ok <- Hosts.request_checks_execution(host_id) do
      conn
      |> put_status(:accepted)
      |> json(%{})
    end
  end

  operation :request_operation,
    summary: "Request operation for a Host",
    tags: ["Operations"],
    description: "Request operation for a Host",
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
    request_body: {"Params", "application/json", OperationParams},
    responses: [
      accepted: OperationAccepted.response(),
      not_found: NotFound.response(),
      forbidden: Forbidden.response(),
      unprocessable_entity: OpenApiSpex.JsonErrorResponse.response()
    ]

  def request_operation(%{assigns: %{host: host}} = conn, %{operation: operation})
      when operation in ["saptune_solution_apply", "saptune_solution_change"] do
    %{solution: solution} = OpenApiSpex.body_params(conn)
    %{id: host_id} = host

    with {:ok, operation_id} <-
           conn
           |> get_operation()
           |> Hosts.request_operation(host_id, %{solution: solution}) do
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
