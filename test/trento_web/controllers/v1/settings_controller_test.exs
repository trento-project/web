defmodule TrentoWeb.V1.SettingsControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory
  import OpenApiSpex.TestAssertions
  import Trento.Support.Helpers.AbilitiesTestHelper

  alias TrentoWeb.OpenApi.V1.ApiSpec

  setup :setup_api_spec_v1
  setup :setup_user

  test "should return the settings according to the schema", %{conn: conn} do
    api_spec = ApiSpec.spec()

    conn = get(conn, "/api/v1/settings")

    conn
    |> json_response(200)
    |> assert_schema("PlatformSettings", api_spec)
  end

  describe "ApiKeySettings" do
    setup do
      %{api_spec: ApiSpec.spec()}
    end

    test "should return not found when api key settings are not configured", %{
      conn: conn,
      api_spec: api_spec
    } do
      conn
      |> get("/api/v1/settings/api_key")
      |> json_response(404)
      |> assert_schema("NotFound", api_spec)
    end

    test "should return the api key settings are configured", %{
      conn: conn,
      api_spec: api_spec
    } do
      insert(:api_key_settings)

      conn
      |> get("/api/v1/settings/api_key")
      |> json_response(200)
      |> assert_schema("ApiKeySettings", api_spec)
    end

    test "should not update the api key settings if it is not configured returning not found",
         %{conn: conn, api_spec: api_spec} do
      conn
      |> put_req_header("content-type", "application/json")
      |> patch("/api/v1/settings/api_key", %{
        expire_at: DateTime.to_iso8601(DateTime.utc_now())
      })
      |> json_response(404)
      |> assert_schema("NotFound", api_spec)
    end

    test "should update the api key settings if it is configured returning the updated settings",
         %{conn: conn, api_spec: api_spec} do
      insert(:api_key_settings)

      conn
      |> put_req_header("content-type", "application/json")
      |> patch("/api/v1/settings/api_key", %{
        expire_at: DateTime.to_iso8601(DateTime.utc_now())
      })
      |> json_response(200)
      |> assert_schema("ApiKeySettings", api_spec)
    end

    test "should consistently return the same generated key across different requests with the same settings",
         %{conn: conn} do
      insert(:api_key_settings)

      %{"generated_api_key" => first_generated_api_key} =
        conn
        |> get("/api/v1/settings/api_key")
        |> json_response(200)

      %{"generated_api_key" => second_generated_api_key} =
        conn
        |> get("/api/v1/settings/api_key")
        |> json_response(200)

      assert first_generated_api_key == second_generated_api_key
    end

    test "should generate an infinite api key if the expiration in the settings is set to nil in an update",
         %{conn: conn} do
      insert(:api_key_settings)

      %{"generated_api_key" => infinite_api_key} =
        conn
        |> put_req_header("content-type", "application/json")
        |> patch("/api/v1/settings/api_key", %{
          expire_at: nil
        })
        |> json_response(200)

      {:ok, %{"exp" => expiration}} = Joken.peek_claims(infinite_api_key)

      {expire_year, _} =
        DateTime.from_unix!(expiration) |> DateTime.to_date() |> Date.year_of_era()

      {expected_infinite_year, _} =
        DateTime.utc_now()
        |> DateTime.add(100 * 365, :day)
        |> DateTime.to_date()
        |> Date.year_of_era()

      assert expire_year == expected_infinite_year
    end
  end

  describe "ActivityLogSettings" do
    setup do
      %{api_spec: ApiSpec.spec()}
    end

    test "should return activity retention settings after setting up", %{
      conn: conn,
      api_spec: api_spec
    } do
      insert(:activity_log_settings)

      conn
      |> get("/api/v1/settings/activity_log")
      |> json_response(200)
      |> assert_schema("ActivityLogSettings", api_spec)
    end

    test "should not return activity retention settings without setting up", %{
      conn: conn,
      api_spec: api_spec
    } do
      conn
      |> get("/api/v1/settings/activity_log")
      |> json_response(404)
      |> assert_schema("NotFound", api_spec)
    end

    test "should update the activity log settings if it is configured returning the updated settings",
         %{conn: conn, api_spec: api_spec} do
      insert(:activity_log_settings)

      conn
      |> put_req_header("content-type", "application/json")
      |> put("/api/v1/settings/activity_log", %{
        retention_time: %{
          value: 42,
          unit: :year
        }
      })
      |> json_response(200)
      |> assert_schema("ActivityLogSettings", api_spec)
    end

    test "should not update the activity log settings if it is not already configured",
         %{conn: conn, api_spec: api_spec} do
      conn
      |> put_req_header("content-type", "application/json")
      |> put("/api/v1/settings/activity_log", %{
        retention_time: %{
          value: 42,
          unit: :year
        }
      })
      |> json_response(422)
      |> assert_schema("UnprocessableEntity", api_spec)
    end
  end

  describe "forbidden response" do
    test "should return forbidden if the user does not have the permission to update the api key",
         %{conn: conn, api_spec: api_spec} do
      insert(:api_key_settings)
      %{id: user_id} = insert(:user)

      conn =
        conn
        |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
        |> put_req_header("content-type", "application/json")

      conn =
        patch(conn, "/api/v1/settings/api_key", %{
          "expire_at" => DateTime.to_iso8601(DateTime.utc_now())
        })

      conn
      |> json_response(:forbidden)
      |> assert_schema("Forbidden", api_spec)
    end

    test "should return forbidden if the user does not have the permission to edit activity logs settings",
         %{conn: conn, api_spec: api_spec} do
      %{id: user_id} = insert(:user)
      insert(:activity_log_settings)

      conn =
        conn
        |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
        |> put_req_header("content-type", "application/json")

      conn =
        put(conn, "/api/v1/settings/activity_log", %{
          retention_time: %{
            value: 42,
            unit: :year
          }
        })

      conn
      |> json_response(:forbidden)
      |> assert_schema("Forbidden", api_spec)
    end
  end
end
