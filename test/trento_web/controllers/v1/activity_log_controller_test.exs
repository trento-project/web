defmodule TrentoWeb.V1.ActivityLogControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory
  import OpenApiSpex.TestAssertions
  import Trento.Support.Helpers.AbilitiesTestHelper

  setup :setup_api_spec_v1
  setup :setup_user

  @user_management_log_types [
    "login_attempt",
    "user_creation",
    "user_modification",
    "user_deletion",
    "profile_update"
  ]

  describe "ActivityLogController" do
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

      assert Enum.empty?(resp["data"])
      assert_schema(resp, "ActivityLog", api_spec)
    end

    test "should return valid response of paginated first, second and third page of results",
         %{
           conn: conn,
           api_spec: api_spec
         } do
      inserted_records = insert_list(6, :activity_log_entry)

      resp =
        conn
        |> get("/api/v1/activity_log?first=2")
        |> json_response(200)

      assert length(resp["data"]) == 2
      assert_schema(resp, "ActivityLog", api_spec)
      next = resp["pagination"]["end_cursor"]

      resp2 =
        conn
        |> get("/api/v1/activity_log?first=2&after=#{next}")
        |> json_response(200)

      assert length(resp2["data"]) == 2
      assert_schema(resp2, "ActivityLog", api_spec)

      next = resp2["pagination"]["end_cursor"]

      resp3 =
        conn
        |> get("/api/v1/activity_log?first=2&after=#{next}")
        |> json_response(200)

      assert length(resp3["data"]) == 2

      paginated_results =
        (resp["data"] ++ resp2["data"] ++ resp3["data"])
        |> Enum.map(fn e -> e["type"] end)
        |> Enum.sort()

      sorted_inserted_records =
        inserted_records |> Enum.map(fn e -> e.type end) |> Enum.sort()

      assert paginated_results == sorted_inserted_records
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

    test "should return valid response of entries provided with date ranges params",
         %{
           conn: conn,
           api_spec: api_spec
         } do
      now = DateTime.utc_now()
      now_minus_30d = DateTime.add(now, -30, :day)
      now_minus_60d = DateTime.add(now, -60, :day)
      now_minus_90d = DateTime.add(now, -90, :day)
      _inserted_records = insert_list(2, :activity_log_entry, %{inserted_at: now})
      _inserted_records = insert_list(4, :activity_log_entry, %{inserted_at: now_minus_30d})
      _inserted_records = insert_list(6, :activity_log_entry, %{inserted_at: now_minus_60d})
      _inserted_records = insert_list(8, :activity_log_entry, %{inserted_at: now_minus_90d})

      resp =
        conn
        |> get("/api/v1/activity_log?from_date=#{now}&to_date=#{now_minus_30d}")
        |> json_response(200)

      assert length(resp["data"]) == 6

      resp =
        conn
        |> get("/api/v1/activity_log?from_date=#{now}&to_date=#{now_minus_60d}")
        |> json_response(200)

      assert length(resp["data"]) == 12

      resp =
        conn
        |> get("/api/v1/activity_log?from_date=#{now_minus_30d}&to_date=#{now_minus_90d}")
        |> json_response(200)

      assert length(resp["data"]) == 18
      assert_schema(resp, "ActivityLog", api_spec)
    end

    test "should not return user management logs if user has all:foo ability",
         %{
           conn: conn,
           api_spec: api_spec
         } do
      for type <- @user_management_log_types do
        insert_list(10, :activity_log_entry, %{type: type})
      end

      %{id: user_id} = insert(:user)

      # We do not use all:all or all:users, in order to test
      # segregation of user mgmt log entries
      %{id: ability_id} = insert(:ability, name: "all", resource: "foo")
      insert(:users_abilities, user_id: user_id, ability_id: ability_id)

      conn =
        Pow.Plug.assign_current_user(conn, %{"user_id" => user_id}, Pow.Plug.fetch_config(conn))

      resp =
        conn
        |> get("/api/v1/activity_log")
        |> json_response(200)

      # We expect an empty response since there are no entries
      # other than user management related ones.
      assert Enum.empty?(resp["data"])
      assert_schema(resp, "ActivityLog", api_spec)
    end

    test "should return user management logs if user has all:users ability",
         %{
           conn: conn,
           api_spec: api_spec
         } do
      for type <- @user_management_log_types do
        insert_list(10, :activity_log_entry, %{type: type})
      end

      %{id: user_id} = insert(:user)

      %{id: ability_id} = insert(:ability, name: "all", resource: "users")
      insert(:users_abilities, user_id: user_id, ability_id: ability_id)

      conn =
        Pow.Plug.assign_current_user(conn, %{"user_id" => user_id}, Pow.Plug.fetch_config(conn))

      resp =
        conn
        |> get("/api/v1/activity_log")
        |> json_response(200)

      assert length(resp["data"]) == 25
      assert_schema(resp, "ActivityLog", api_spec)
    end
  end
end
