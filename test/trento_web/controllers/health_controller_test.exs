defmodule Trento.HealthControllerTest do
  @moduledoc false

  use TrentoWeb.ConnCase, async: true

  import OpenApiSpex.TestAssertions

  alias TrentoWeb.OpenApi.V1.ApiSpec

  setup do
    %{api_spec: ApiSpec.spec()}
  end

  describe "Health" do
    test "report healthy state when database is up for /healthz endpoint", %{
      conn: conn,
      api_spec: api_spec
    } do
      response =
        conn
        |> get("/api/healthz")
        |> json_response(200)

      assert_schema(response, "Health", api_spec)
    end

    test "report healthy state for /readyz endpoint", %{
      conn: conn,
      api_spec: api_spec
    } do
      response =
        conn
        |> get("/api/readyz")
        |> json_response(200)

      assert_schema(response, "Ready", api_spec)
    end
  end
end
