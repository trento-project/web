defmodule TrentoWeb.V1.DatabaseController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.Repo

  alias Trento.Databases

  alias Trento.Databases.Projections.DatabaseReadModel

  alias TrentoWeb.OpenApi.V1.Schema

  alias TrentoWeb.OpenApi.V1.Schema.{
    DatabaseOperationParams,
    Forbidden,
    NotFound,
    OperationAccepted,
    UnprocessableEntity
  }

  plug TrentoWeb.Plugs.LoadUserPlug

  plug Bodyguard.Plug.Authorize,
    policy: Trento.Databases.Policy,
    action: {Phoenix.Controller, :action_name},
    user: {Pow.Plug, :current_user},
    params: {__MODULE__, :get_policy_resource},
    fallback: TrentoWeb.FallbackController

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true

  plug TrentoWeb.Plugs.OperationsPolicyPlug,
       [
         policy: Trento.Operations.DatabasePolicy,
         resource: &__MODULE__.get_operation_database/1,
         operation: &__MODULE__.get_operation/1,
         assigns_to: :database,
         params: &__MODULE__.get_operation_params/1
       ]
       when action == :request_operation

  action_fallback TrentoWeb.FallbackController

  tags ["Target Infrastructure"]

  operation :list_databases,
    summary: "List HANA Databases.",
    description:
      "Retrieves a comprehensive list of all HANA Databases discovered on the target infrastructure, supporting monitoring and management tasks for administrators.",
    responses: [
      ok:
        {"Comprehensive list of all HANA Databases discovered on the target infrastructure for monitoring and management.",
         "application/json", Schema.Database.DatabasesCollection}
    ]

  def list_databases(conn, _) do
    databases = Databases.get_all_databases()

    render(conn, :databases, databases: databases)
  end

  operation :delete_database_instance,
    summary: "Delete database instance.",
    description:
      "Removes the specified database instance from the system if it is no longer present, supporting infrastructure cleanup and resource management.",
    parameters: [
      id: [
        in: :path,
        description:
          "Unique identifier of the database instance to be deleted. This value must be a valid UUID string.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "d1a2b3c4-d5e6-7890-abcd-ef1234567890"
        }
      ],
      host_id: [
        in: :path,
        description:
          "Unique identifier of the host associated with the database instance. This value must be a valid UUID string.",
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
          "The instance number of the database to be deleted, used to uniquely identify the specific database instance within the host.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          example: "10"
        }
      ]
    ],
    responses: [
      no_content: "The database instance has been deregistered.",
      not_found: NotFound.response(),
      unprocessable_entity: UnprocessableEntity.response()
    ]

  @spec delete_database_instance(Plug.Conn.t(), map) :: {:error, any} | Plug.Conn.t()
  def delete_database_instance(conn, %{
        id: sap_system_id,
        host_id: host_id,
        instance_number: instance_number
      }) do
    with :ok <- Databases.deregister_database_instance(sap_system_id, host_id, instance_number) do
      send_resp(conn, 204, "")
    end
  end

  operation :request_operation,
    summary: "Request operation for a Database",
    tags: ["Operations"],
    description:
      "Initiates a specific operation on a database instance, such as starting or stopping the database. This endpoint supports operational management and allows administrators to control database lifecycle.",
    parameters: [
      id: [
        in: :path,
        description:
          "Unique identifier of the database for which the operation is requested. This value must be a valid UUID string.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "d1a2b3c4-d5e6-7890-abcd-ef1234567890"
        }
      ],
      operation: [
        in: :path,
        description:
          "The type of operation to perform on the database. Supported operations include 'database_start' and 'database_stop' for controlling database lifecycle.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          enum: ["database_start", "database_stop"],
          example: "database_start"
        }
      ]
    ],
    request_body: {"Operation parameters", "application/json", DatabaseOperationParams},
    responses: [
      accepted: OperationAccepted.response(),
      not_found: NotFound.response(),
      forbidden: Forbidden.response(),
      unprocessable_entity: UnprocessableEntity.response()
    ]

  def request_operation(
        %{
          assigns: %{database: %{id: database_id}, operation: operation}
        } = conn,
        _
      ) do
    params = OpenApiSpex.body_params(conn)

    with {:ok, operation_id} <-
           Databases.request_operation(
             operation,
             database_id,
             params
           ) do
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

  def get_policy_resource(_), do: DatabaseReadModel

  def get_operation_database(%{
        params: %{
          id: database_id
        },
        body_params: body_params
      }) do
    site = Map.get(body_params, :site, nil)

    database_id
    |> Databases.get_database_by_id()
    |> Repo.preload(database_instances: [host: [:cluster]], sap_systems: [:application_instances])
    |> case do
      nil ->
        nil

      %DatabaseReadModel{} = database when is_nil(site) ->
        database

      # return not found if the given site does not exist in the database
      %DatabaseReadModel{database_instances: instances} = database ->
        Enum.find_value(instances, nil, fn
          %{system_replication_site: ^site} -> database
          _ -> false
        end)
    end
  end

  def get_operation_database(_), do: nil

  def get_operation_params(%{
        body_params: body_params
      }) do
    body_params
  end

  def get_operation(%{params: %{operation: "database_start"}}),
    do: :database_start

  def get_operation(%{params: %{operation: "database_stop"}}),
    do: :database_stop

  def get_operation(_), do: nil
end
