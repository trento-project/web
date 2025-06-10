defmodule TrentoWeb.V1.SapSystemController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.Repo

  alias Trento.SapSystems

  alias Trento.SapSystems.Projections.SapSystemReadModel

  alias TrentoWeb.OpenApi.V1.Schema

  alias TrentoWeb.OpenApi.V1.Schema.{
    Forbidden,
    NotFound,
    OperationAccepted,
    SapSystemOperationParams,
    UnprocessableEntity
  }

  plug TrentoWeb.Plugs.LoadUserPlug

  plug Bodyguard.Plug.Authorize,
    policy: Trento.SapSystems.Policy,
    action: {Phoenix.Controller, :action_name},
    user: {Pow.Plug, :current_user},
    params: {__MODULE__, :get_policy_resource},
    fallback: TrentoWeb.FallbackController

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true

  plug TrentoWeb.Plugs.OperationsPolicyPlug,
       [
         policy: Trento.Operations.SapSystemPolicy,
         resource: &__MODULE__.get_operation_resource/1,
         operation: &__MODULE__.get_operation/1,
         assigns_to: :sap_system
       ]
       when action == :request_operation

  action_fallback TrentoWeb.FallbackController

  tags ["Target Infrastructure"]

  operation :list,
    summary: "List SAP Systems",
    description: "List all the discovered SAP Systems on the target infrastructure",
    responses: [
      ok:
        {"A collection of the discovered SAP Systems", "application/json",
         Schema.SAPSystem.SAPSystemsCollection}
    ]

  def list(conn, _) do
    sap_systems = SapSystems.get_all_sap_systems()

    render(conn, :sap_systems, sap_systems: sap_systems)
  end

  operation :delete_application_instance,
    summary: "Delete application instance",
    description:
      "Delete the application instance identified by the provided data if it is absent",
    parameters: [
      id: [
        in: :path,
        required: true,
        type: %OpenApiSpex.Schema{type: :string, format: :uuid}
      ],
      host_id: [
        in: :path,
        required: true,
        type: %OpenApiSpex.Schema{type: :string, format: :uuid}
      ],
      instance_number: [
        in: :path,
        required: true,
        type: %OpenApiSpex.Schema{type: :string}
      ]
    ],
    responses: [
      no_content: "The application instance has been deregistered",
      not_found: NotFound.response(),
      unprocessable_entity: UnprocessableEntity.response()
    ]

  @spec delete_application_instance(Plug.Conn.t(), map) :: {:error, any} | Plug.Conn.t()
  def delete_application_instance(conn, %{
        id: sap_system_id,
        host_id: host_id,
        instance_number: instance_number
      }) do
    with :ok <-
           SapSystems.deregister_application_instance(sap_system_id, host_id, instance_number) do
      send_resp(conn, 204, "")
    end
  end

  operation :request_operation,
    summary: "Request operation for a SAP system",
    tags: ["Operations"],
    description: "Request operation for a SAP system",
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
    request_body: {"Params", "application/json", SapSystemOperationParams},
    responses: [
      accepted: OperationAccepted.response(),
      not_found: NotFound.response(),
      forbidden: Forbidden.response(),
      unprocessable_entity: OpenApiSpex.JsonErrorResponse.response()
    ]

  def request_operation(%{assigns: %{operation: operation}} = conn, _) do
    %{id: sap_system_id} = OpenApiSpex.params(conn)
    params = OpenApiSpex.body_params(conn)

    with {:ok, operation_id} <- SapSystems.request_operation(operation, sap_system_id, params) do
      conn
      |> put_status(:accepted)
      |> json(%{operation_id: operation_id})
    end
  end

  def get_policy_resource(_), do: SapSystemReadModel

  def get_operation_resource(%{
        params: %{id: sap_system_id, operation: operation},
        body_params: %{host_id: host_id, instance_number: inst_number}
      })
      when operation in ["sap_instance_start", "sap_instance_stop"] do
    sap_system_id
    |> SapSystems.get_application_instances_by_id()
    |> Enum.find(fn
      %{host_id: ^host_id, instance_number: ^inst_number} -> true
      _ -> false
    end)
    |> Repo.preload(host: :cluster)
  end

  def get_operation_resource(_), do: nil

  def get_operation(%{params: %{operation: "sap_instance_start"}}),
    do: :sap_instance_start

  def get_operation(%{params: %{operation: "sap_instance_stop"}}),
    do: :sap_instance_stop

  def get_operation(_), do: nil
end
