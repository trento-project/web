# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.V1.DatabaseController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs
  use Trento.AI.ControllerSpecs

  alias Trento.Repo

  alias Trento.Databases
  alias Trento.Support.OperationsHelper

  alias Trento.Databases.Projections.DatabaseReadModel

  alias TrentoWeb.OpenApi.V1.Schema

  alias TrentoWeb.OpenApi.V1.Schema.{
    BulkOperationAccepted,
    Forbidden,
    NotFound,
    OperationAccepted,
    UnprocessableEntity
  }

  alias TrentoWeb.OpenApi.V1.Schema.Operations.{
    DatabaseBulkStartStopParams,
    DatabaseStartStopParams
  }

  require Trento.Operations.Enums.DatabaseOperations, as: DatabaseOperations
  require Trento.Operations.Enums.DatabaseBulkOperations, as: DatabaseBulkOperations

  @bulk_actions Map.new(
                  DatabaseBulkOperations.values(),
                  &{OperationsHelper.to_bulk_operation(&1), &1}
                )
  @database_bulk_operations Map.keys(@bulk_actions)

  plug TrentoWeb.Plugs.LoadUserPlug

  plug Bodyguard.Plug.Authorize,
    policy: Trento.Databases.Policy,
    action: {__MODULE__, :get_action},
    user: {Pow.Plug, :current_user},
    params: {__MODULE__, :get_policy_resource},
    fallback: TrentoWeb.FallbackController

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true

  plug TrentoWeb.Plugs.OperationsPolicyPlug,
       [
         policy: Trento.Operations.DatabasePolicy,
         resource: &__MODULE__.get_operation_database/1,
         operation: &__MODULE__.get_action/1,
         assigns_to: :database,
         params: &__MODULE__.get_operation_params/1
       ]
       when action in DatabaseOperations.values() or action in @database_bulk_operations

  action_fallback TrentoWeb.FallbackController

  operation :list_databases,
    summary: "List HANA Databases.",
    tags: ["Target Infrastructure", "MCP"],
    description:
      "Retrieves a comprehensive list of all HANA Databases discovered on the target infrastructure, supporting monitoring and management tasks for administrators.",
    responses: [
      ok:
        {"Comprehensive list of all HANA Databases discovered on the target infrastructure for monitoring and management.",
         "application/json", Schema.Database.DatabasesCollection}
    ]

  ai_tool :database_list, display_text: "List HANA databases"

  def list_databases(conn, _) do
    databases = Databases.get_all_databases()

    render(conn, :databases, databases: databases)
  end

  operation :delete_database_instance,
    summary: "Delete database instance.",
    tags: ["Target Infrastructure"],
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

  @operations [
    %{
      operation: DatabaseOperations.database_start(),
      summary: "Request database start operation",
      description: "Request database start operation on a database to trigger a start action.",
      request_body: DatabaseStartStopParams
    },
    %{
      operation: DatabaseOperations.database_stop(),
      summary: "Request database stop operation",
      description: "Request database stop operation on a database to trigger a stop action.",
      request_body: DatabaseStartStopParams
    }
  ]

  for %{
        operation: database_operation,
        summary: summary,
        description: description,
        request_body: request_body
      } <- @operations do
    @op database_operation

    operation @op,
      summary: summary,
      tags: ["Operations"],
      description: description,
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
        ]
      ],
      request_body:
        request_body &&
          {"Request containing parameters for the specified database operation",
           "application/json", request_body, required: true},
      responses: [
        accepted: OperationAccepted.response(),
        not_found: NotFound.response(),
        forbidden: Forbidden.response(),
        unprocessable_entity: UnprocessableEntity.response()
      ]

    def unquote(database_operation)(conn, params) do
      request_operation(conn, params)
    end
  end

  @bulk_operations [
    %{
      operation: DatabaseBulkOperations.database_start(),
      summary: "Request database start bulk operation",
      description:
        "Request database start operation to start multiple databases at once, in all their system replication sites. The request is forbidden if any of the databases is not authorized to run the operation. Otherwise, an individual operation is requested for every database.",
      request_body: DatabaseBulkStartStopParams
    },
    %{
      operation: DatabaseBulkOperations.database_stop(),
      summary: "Request database stop bulk operation",
      description:
        "Request database stop operation to stop multiple databases at once, in all their system replication sites. The request is forbidden if any of the databases is not authorized to run the operation. Otherwise, an individual operation is requested for every database.",
      request_body: DatabaseBulkStartStopParams
    }
  ]

  for %{
        operation: database_operation,
        summary: summary,
        description: description,
        request_body: request_body
      } <- @bulk_operations do
    @bulk_action OperationsHelper.to_bulk_operation(database_operation)

    operation @bulk_action,
      summary: summary,
      tags: ["Operations"],
      description: description,
      request_body:
        {"Request containing the databases and the parameters for the specified database bulk operation.",
         "application/json", request_body},
      responses: [
        accepted: BulkOperationAccepted.response(),
        not_found: NotFound.response(),
        forbidden: Forbidden.response(),
        unprocessable_entity: UnprocessableEntity.response()
      ]

    def unquote(@bulk_action)(conn, params) do
      request_bulk_operation(conn, params)
    end
  end

  def get_action(conn) do
    action = Phoenix.Controller.action_name(conn)
    Map.get(@bulk_actions, action, action)
  end

  def get_policy_resource(_), do: DatabaseReadModel

  def get_operation_database(%{body_params: %{database_ids: database_ids}}) do
    databases =
      database_ids
      |> Databases.get_databases_by_ids()
      |> Repo.preload(
        database_instances: [host: [:cluster]],
        sap_systems: [:application_instances]
      )

    OperationsHelper.ensure_all_found(database_ids, databases, "Databases")
  end

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

  def get_operation_params(%{body_params: %{database_ids: _} = body_params}) do
    Map.get(body_params, :params, %{})
  end

  def get_operation_params(%{
        body_params: body_params
      }) do
    body_params
  end

  defp request_operation(
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

  defp request_bulk_operation(%{assigns: %{operation: operation}} = conn, _) do
    %{database_ids: database_ids} = body_params = OpenApiSpex.body_params(conn)
    params = Map.get(body_params, :params, %{})

    with {:ok, bulk_operation_id, operations, failed_requests} <-
           Databases.request_bulk_operation(operation, database_ids, params) do
      conn
      |> put_status(:accepted)
      |> put_view(json: TrentoWeb.V1.OperationJSON)
      |> render(:bulk_operation_accepted,
        bulk_operation_id: bulk_operation_id,
        operations: operations,
        failed_requests: failed_requests
      )
    end
  end
end
