defmodule TrentoWeb.SapSystemControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory

  import OpenApiSpex.TestAssertions

  alias TrentoWeb.OpenApi.ApiSpec

  describe "list" do
    test "should list all sap_systems", %{conn: conn} do
      0..2
      |> Enum.map(fn _ -> insert(:sap_system) end)
      |> Enum.sort_by(& &1.sid)

      api_spec = ApiSpec.spec()

      conn = get(conn, Routes.sap_system_path(conn, :list))

      conn
      |> json_response(200)
      |> assert_schema("SAPSystemsCollection", api_spec)
    end

    test "should list all databases", %{conn: conn} do
      0..2
      |> Enum.map(fn _ -> insert(:database) end)
      |> Enum.sort_by(& &1.sid)

      api_spec = ApiSpec.spec()

      conn = get(conn, Routes.sap_system_path(conn, :list_databases))

      conn
      |> json_response(200)
      |> assert_schema("DatabasesCollection", api_spec)
    end
  end
end
