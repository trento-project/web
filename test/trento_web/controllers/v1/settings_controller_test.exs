defmodule TrentoWeb.V1.SettingsControllerTest do
  use TrentoWeb.ConnCase, async: true

  import OpenApiSpex.TestAssertions

  alias TrentoWeb.OpenApi.ApiSpec

  test "should return the settings according to the schema", %{conn: conn} do
    api_spec = ApiSpec.spec()

    conn = get(conn, "/api/v1/settings")

    conn
    |> json_response(200)
    |> assert_schema("PlatformSettings", api_spec)
  end
end
