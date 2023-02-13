defmodule TrentoWeb.V1.SapSystemControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory

  import OpenApiSpex.TestAssertions

  alias TrentoWeb.OpenApi.ApiSpec

  describe "list" do
    test "should list all sap_systems", %{conn: conn} do
      sap_system_id = UUID.uuid4()

      insert(:sap_system, id: sap_system_id)
      insert_list(2, :database_instance, sap_system_id: sap_system_id)
      insert_list(2, :application_instance, sap_system_id: sap_system_id)

      api_spec = ApiSpec.spec()

      conn = get(conn, "/api/v1/sap_systems")

      conn
      |> json_response(200)
      |> assert_schema("SAPSystemsCollection", api_spec)
    end

    test "should list all databases", %{conn: conn} do
      database_id = UUID.uuid4()

      insert(:database, id: database_id)
      insert_list(2, :database_instance, sap_system_id: database_id)

      api_spec = ApiSpec.spec()

      conn = get(conn, "/api/v1/databases")

      conn
      |> json_response(200)
      |> assert_schema("DatabasesCollection", api_spec)
    end
  end
end
