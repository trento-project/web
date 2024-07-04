defmodule TrentoWeb.V1.ActivityLogControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory
  import OpenApiSpex.TestAssertions

  alias TrentoWeb.OpenApi.V1.ApiSpec

  describe "ActivityLogController" do
    setup do
      %{api_spec: ApiSpec.spec()}
    end

    test "should return activity logs after inserting a few entries.", %{
      conn: conn,
      api_spec: api_spec
    } do
      insert(:activity_log_entry)
      insert(:activity_log_entry)

      resp =
        conn
        |> get("/api/v1/activity_log")
        |> json_response(200)

      assert length(resp) == 2
      assert_schema(resp, "ActivityLog", api_spec)
    end

    test "should return valid response (empty list) if no activity logs entries exist", %{
      conn: conn,
      api_spec: api_spec
    } do
      resp =
        conn
        |> get("/api/v1/activity_log")
        |> json_response(200)

      assert resp == []
      assert_schema(resp, "ActivityLog", api_spec)
    end
  end
end
