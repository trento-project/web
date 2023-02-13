defmodule TrentoWeb.V1.InstallationControllerTest do
  use TrentoWeb.ConnCase, async: true

  import OpenApiSpex.TestAssertions

  alias TrentoWeb.OpenApi.ApiSpec

  test "should return the api key", %{conn: conn} do
    api_spec = ApiSpec.spec()

    get(conn, "/api/v1/installation/api-key")
    |> json_response(200)
    |> assert_schema("ApiKey", api_spec)
  end
end
