defmodule TrentoWeb.V1.ActivityLogControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory
  import OpenApiSpex.TestAssertions

  alias TrentoWeb.OpenApi.V1.ApiSpec

  describe "ActivityLogController" do
    setup do
      %{api_spec: ApiSpec.spec()}
    end

    test "should return activity retention settings after setting up", %{
      conn: conn,
      api_spec: api_spec
    } do
      insert(:activity_log_entry)

      conn
      |> get("/api/v1/activity_log")
      |> json_response(200)
      |> assert_schema("ActivityLog", api_spec)
    end

    test "should return valid response (empty list) if no activity logs entries exist", %{
      conn: conn,
      api_spec: api_spec
    } do
      conn
      |> get("/api/v1/activity_log")
      |> json_response(200)
      |> assert_schema("ActivityLog", api_spec)
    end
  end
end
