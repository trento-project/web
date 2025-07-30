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
         assigns_to: :database
       ]
       when action == :request_operation

  action_fallback TrentoWeb.FallbackController

  tags ["Target Infrastructure"]

  operation :list_databases,
    summary: "List HANA Databases",
    description: "List all the discovered HANA Databases on the target infrastructure",
    responses: [
      ok:
        {"A collection of the discovered HANA Databases", "application/json",
         Schema.Database.DatabasesCollection}
    ]

  def list_databases(conn, _) do
    databases = Databases.get_all_databases()

    render(conn, :databases, databases: databases)
  end

  operation :delete_database_instance,
    summary: "Delete database instance",
    description: "Delete the database instance identified by the provided data if it is absent",
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
      no_content: "The database instance has been deregistered",
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
    description: "Request operation for a Database",
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
    request_body: {"Params", "application/json", DatabaseOperationParams},
    responses: [
      accepted: OperationAccepted.response(),
      not_found: NotFound.response(),
      forbidden: Forbidden.response(),
      unprocessable_entity: OpenApiSpex.JsonErrorResponse.response()
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
    |> Repo.preload([:database_instances])
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

  def get_operation(%{params: %{operation: "database_start"}}),
    do: :database_start

  def get_operation(%{params: %{operation: "database_stop"}}),
    do: :database_stop

  def get_operation(_), do: nil
end
