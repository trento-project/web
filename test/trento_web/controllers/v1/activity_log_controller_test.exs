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
      insert_list(100, :activity_log_entry)

      resp =
        conn
        |> get("/api/v1/activity_log")
        |> json_response(200)

      assert length(resp["data"]) == 25
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

      assert resp["data"] == []
      assert_schema(resp, "ActivityLog", api_spec)
    end

    test "should return valid response (list with 10 elements) if provided with suitable params",
         %{
           conn: conn,
           api_spec: api_spec
         } do
      insert_list(100, :activity_log_entry)

      resp =
        conn
        |> get("/api/v1/activity_log?first=10")
        |> json_response(200)

      assert length(resp["data"]) == 10
      assert_schema(resp, "ActivityLog", api_spec)
    end

    test "should return valid response (list with 25 elements) for actor=aktor if provided with suitable params",
         %{
           conn: conn,
           api_spec: api_spec
         } do
      _inserted_records = insert_list(50, :activity_log_entry, %{actor: "aktor"})

      resp =
        conn
        |> get("/api/v1/activity_log?actor[]=aktor")
        |> json_response(200)

      assert length(resp["data"]) == 25
      assert_schema(resp, "ActivityLog", api_spec)
    end

    test "should return valid response of empty list if no actor matches provided with suitable params",
         %{
           conn: conn,
           api_spec: api_spec
         } do
      _inserted_records = insert_list(50, :activity_log_entry, %{actor: "aktor"})

      resp =
        conn
        |> get("/api/v1/activity_log?actor[]=not-aktor")
        |> json_response(200)

      assert length(resp["data"]) == 0
      assert_schema(resp, "ActivityLog", api_spec)
    end

    test "should return valid response of a list for type Tagging entries provided with suitable params",
         %{
           conn: conn,
           api_spec: api_spec
         } do
      _inserted_records = insert_list(10, :activity_log_entry, %{type: "Tagging"})
      _inserted_records = insert_list(10, :activity_log_entry, %{type: "UnBar"})
      _inserted_records = insert_list(50, :activity_log_entry, %{type: "SomethingElse"})

      resp =
        conn
        |> get("/api/v1/activity_log?type[]=Tagging&type[]=UnBar")
        |> json_response(200)

      assert length(resp["data"]) == 20
      assert_schema(resp, "ActivityLog", api_spec)
    end
  end
end
