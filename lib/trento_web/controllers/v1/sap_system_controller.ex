defmodule TrentoWeb.V1.SapSystemController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.Repo

  alias Trento.SapSystems

  alias Trento.SapSystems.Projections.{
    ApplicationInstanceReadModel,
    SapSystemReadModel
  }

  alias TrentoWeb.OpenApi.V1.Schema

  alias TrentoWeb.OpenApi.V1.Schema.{
    Forbidden,
    NotFound,
    OperationAccepted,
    UnprocessableEntity
  }

  alias TrentoWeb.OpenApi.V1.Schema.Operations.{
    SapInstanceStartStopParams,
    SapSystemStartStopParams
  }

  require Trento.Operations.Enums.SapInstanceOperations, as: SapInstanceOperations
  require Trento.Operations.Enums.SapSystemOperations, as: SapSystemOperations

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
         policy: Trento.Operations.ApplicationInstancePolicy,
         resource: &__MODULE__.get_operation_instance/1,
         operation: &Phoenix.Controller.action_name/1,
         assigns_to: :instance
       ]
       when action in SapInstanceOperations.values()

  plug TrentoWeb.Plugs.OperationsPolicyPlug,
       [
         policy: Trento.Operations.SapSystemPolicy,
         resource: &__MODULE__.get_operation_system/1,
         operation: &Phoenix.Controller.action_name/1,
         assigns_to: :sap_system,
         params: &__MODULE__.get_operation_params/1
       ]
       when action in SapSystemOperations.values()

  action_fallback TrentoWeb.FallbackController

  operation :list,
    summary: "List SAP Systems.",
    description:
      "Retrieves a comprehensive list of all SAP Systems discovered on the target infrastructure, supporting monitoring and management tasks for administrators.",
    tags: ["Target Infrastructure", "MCP"],
    responses: [
      ok:
        {"Comprehensive list of all SAP Systems discovered on the target infrastructure for monitoring and management.",
         "application/json", Schema.SAPSystem.SAPSystemsCollection}
    ]

  def list(conn, _) do
    sap_systems = SapSystems.get_all_sap_systems()

    render(conn, :sap_systems, sap_systems: sap_systems)
  end

  operation :delete_application_instance,
    summary: "Delete application instance.",
    description:
      "Removes the specified application instance from the system if it is no longer present, supporting infrastructure cleanup and resource management.",
    tags: ["Target Infrastructure"],
    parameters: [
      id: [
        in: :path,
        description:
          "Unique identifier of the SAP system associated with the application instance to be deleted. This value must be a valid UUID string.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "d59523fc-0497-4b1e-9fdd-14aa7cda77f1"
        }
      ],
      host_id: [
        in: :path,
        description:
          "Unique identifier of the host associated with the application instance. This value must be a valid UUID string.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "d59523fc-0497-4b1e-9fdd-14aa7cda77f1"
        }
      ],
      instance_number: [
        in: :path,
        description:
          "The instance number of the SAP application to be deleted, used to uniquely identify the specific application instance within the host.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          example: "10"
        }
      ]
    ],
    responses: [
      no_content: "The application instance has been deregistered.",
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

  @instance_operations [
    %{
      operation: SapInstanceOperations.sap_instance_start(),
      summary: "Request SAP instance start operation",
      description:
        "Request SAP instance start operation on a SAP system to trigger a specific instance start action.",
      request_body: SapInstanceStartStopParams
    },
    %{
      operation: SapInstanceOperations.sap_instance_stop(),
      summary: "Request SAP instance stop operation",
      description:
        "Request SAP instance stop operation on a SAP system to trigger a specific instance stop action.",
      request_body: SapInstanceStartStopParams
    }
  ]

  for %{
        operation: instance_operation,
        summary: summary,
        description: description,
        request_body: request_body
      } <- @instance_operations do
    @instance_op instance_operation

    operation @instance_op,
      summary: summary,
      tags: ["Operations"],
      description: description,
      parameters: [
        id: [
          in: :path,
          description:
            "Unique identifier of the SAP system associated with the application instance. This value must be a valid UUID string.",
          required: true,
          schema: %OpenApiSpex.Schema{
            type: :string,
            format: :uuid,
            example: "d59523fc-0497-4b1e-9fdd-14aa7cda77f1"
          }
        ],
        host_id: [
          in: :path,
          description:
            "Unique identifier of the host associated with the application instance. This value must be a valid UUID string.",
          required: true,
          schema: %OpenApiSpex.Schema{
            type: :string,
            format: :uuid,
            example: "d59523fc-0497-4b1e-9fdd-14aa7cda77f1"
          }
        ],
        instance_number: [
          in: :path,
          description:
            "The instance number of the SAP application instance, used to uniquely identify the specific instance within the host.",
          required: true,
          schema: %OpenApiSpex.Schema{
            type: :string,
            example: "10"
          }
        ]
      ],
      request_body:
        request_body &&
          {"Request containing parameters for the specified SAP application instance operation.",
           "application/json", request_body},
      responses: [
        accepted: OperationAccepted.response(),
        not_found: NotFound.response(),
        forbidden: Forbidden.response(),
        unprocessable_entity: UnprocessableEntity.response()
      ]

    def unquote(instance_operation)(conn, params) do
      request_instance_operation(conn, params)
    end
  end

  @system_operations [
    %{
      operation: SapSystemOperations.sap_system_start(),
      summary: "Request SAP system start operation",
      description:
        "Request SAP system start operation on a SAP system to trigger a start action.",
      request_body: SapSystemStartStopParams
    },
    %{
      operation: SapSystemOperations.sap_system_stop(),
      summary: "Request SAP system stop operation",
      description: "Request SAP system stop operation on a SAP system to trigger a stop action.",
      request_body: SapSystemStartStopParams
    }
  ]

  for %{
        operation: system_operation,
        summary: summary,
        description: description,
        request_body: request_body
      } <- @system_operations do
    @system_op system_operation

    operation @system_op,
      summary: summary,
      tags: ["Operations"],
      description: description,
      parameters: [
        id: [
          in: :path,
          description:
            "Unique identifier of the SAP system on which the operation will be performed. This value must be a valid UUID string.",
          required: true,
          schema: %OpenApiSpex.Schema{
            type: :string,
            format: :uuid,
            example: "d59523fc-0497-4b1e-9fdd-14aa7cda77f1"
          }
        ]
      ],
      request_body:
        request_body &&
          {"Request containing parameters for the specified SAP system operation.",
           "application/json", request_body},
      responses: [
        accepted: OperationAccepted.response(),
        not_found: NotFound.response(),
        forbidden: Forbidden.response(),
        unprocessable_entity: UnprocessableEntity.response()
      ]

    def unquote(system_operation)(conn, params) do
      request_operation(conn, params)
    end
  end

  def get_policy_resource(%{
        private: %{phoenix_action: action}
      })
      when action in SapInstanceOperations.values(),
      do: ApplicationInstanceReadModel

  def get_policy_resource(_), do: SapSystemReadModel

  def get_operation_instance(%{
        params: %{
          id: sap_system_id,
          host_id: host_id,
          instance_number: inst_number
        }
      }) do
    instances = SapSystems.get_application_instances_by_id(sap_system_id)

    instances
    |> Enum.find(fn
      %{host_id: ^host_id, instance_number: ^inst_number} -> true
      _ -> false
    end)
    |> Repo.preload(
      sap_system: [:database, application_instances: fn _ -> instances end],
      host: :cluster
    )
  end

  def get_operation_instance(_), do: nil

  def get_operation_system(%{
        params: %{
          id: sap_system_id
        }
      }) do
    sap_system_id
    |> SapSystems.get_sap_system_by_id()
    |> Repo.preload([:database_instances, [application_instances: [host: :cluster]]])
  end

  def get_operation_system(_), do: nil

  def get_operation_params(%{
        body_params: body_params
      }) do
    body_params
  end

  defp request_instance_operation(
         %{assigns: %{instance: instance, operation: operation}} = conn,
         _
       ) do
    %{host_id: host_id, instance_number: instance_number} = instance
    params = OpenApiSpex.body_params(conn)

    with {:ok, operation_id} <-
           SapSystems.request_instance_operation(
             operation,
             host_id,
             instance_number,
             params
           ) do
      conn
      |> put_status(:accepted)
      |> json(%{operation_id: operation_id})
    end
  end

  defp request_operation(
         %{
           assigns: %{sap_system: %{id: sap_system_id}, operation: operation}
         } = conn,
         _
       ) do
    params = OpenApiSpex.body_params(conn)

    with {:ok, operation_id} <-
           SapSystems.request_operation(
             operation,
             sap_system_id,
             params
           ) do
      conn
      |> put_status(:accepted)
      |> json(%{operation_id: operation_id})
    end
  end
end
