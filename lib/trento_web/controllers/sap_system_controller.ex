defmodule TrentoWeb.SapSystemController do
  use TrentoWeb, :controller

  alias Trento.SapSystems

  alias Trento.Support.StructHelper

  use OpenApiSpex.ControllerSpecs

  tags ["Target Infrastructure"]

  operation :list,
    summary: "List SAP Systems",
    description: "List all the discovered SAP Systems on the target infrastructure",
    responses: [
      ok:
        {"A collection of the discovered SAP Systems", "application/json",
         TrentoWeb.OpenApi.Schema.SAPSystem.SAPSystemsCollection}
    ]

  ## TODO Fix sanitization
  def list(conn, _) do
    sap_systems =
      SapSystems.get_all_sap_systems()
      # TODO: fix me with DTOs
      |> StructHelper.to_map()

    json(conn, sap_systems)
  end

  operation :list_databases,
    summary: "List HANA Databases",
    description: "List all the discovered HANA Databases on the target infrastructure",
    responses: [
      ok:
        {"A collection of the discovered HANA Databases", "application/json",
         TrentoWeb.OpenApi.Schema.Database.DatabasesCollection}
    ]

  def list_databases(conn, _) do
    databases =
      SapSystems.get_all_databases()
      # TODO: fix me with DTOs
      |> StructHelper.to_map()

    json(conn, databases)
  end
end
