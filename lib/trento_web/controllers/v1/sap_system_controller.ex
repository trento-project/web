defmodule TrentoWeb.V1.SapSystemController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.SapSystems

  alias TrentoWeb.OpenApi.V1.Schema

  alias TrentoWeb.OpenApi.V1.Schema.{
    NotFound,
    UnprocessableEntity
  }

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
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

    render(conn, "sap_systems.json", sap_systems: sap_systems)
  end

  operation :list_databases,
    summary: "List HANA Databases",
    description: "List all the discovered HANA Databases on the target infrastructure",
    responses: [
      ok:
        {"A collection of the discovered HANA Databases", "application/json",
         Schema.Database.DatabasesCollection}
    ]

  def list_databases(conn, _) do
    databases = SapSystems.get_all_databases()

    render(conn, "databases.json", databases: databases)
  end

  operation :delete_application_instance,
    summary: "Delete application instance",
    description: "Delete the application instance identified by the provided data",
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
    case SapSystems.deregister_application_instance(sap_system_id, host_id, instance_number) do
      :ok -> send_resp(conn, 204, "")
      {:error, error} -> {:error, error}
    end
  end

  operation :delete_database_instance,
    summary: "Delete database instance",
    description: "Delete the database instance identified by the provided data",
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
    case SapSystems.deregister_database_instance(sap_system_id, host_id, instance_number) do
      :ok -> send_resp(conn, 204, "")
      {:error, error} -> {:error, error}
    end
  end
end
