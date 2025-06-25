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

  def get_policy_resource(_), do: Trento.Databases.Projections.DatabaseReadModel
end
