defmodule TrentoWeb.V1.DatabaseController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.Databases

  alias TrentoWeb.OpenApi.V1.Schema

  alias TrentoWeb.OpenApi.V1.Schema.{
    NotFound,
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

  def get_policy_resource(_), do: Trento.Databases.Projections.DatabaseReadModel
end
