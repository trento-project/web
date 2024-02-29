defmodule TrentoWeb.V1.SettingsControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory
  import OpenApiSpex.TestAssertions

  alias TrentoWeb.OpenApi.V1.ApiSpec

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

    test "should return the api key settings if they are configured", %{
      conn: conn,
      api_spec: api_spec
    } do
      insert(:api_key_settings)

      conn
      |> get("/api/v1/settings/api_key")
      |> json_response(200)
      |> assert_schema("ApiKeySettings", api_spec)
    end

    test "should not update the api key settings if they are not configured and return not found",
         %{conn: conn, api_spec: api_spec} do
      conn
      |> put_req_header("content-type", "application/json")
      |> patch("/api/v1/settings/api_key", %{
        expire_at: DateTime.to_iso8601(DateTime.utc_now())
      })
      |> json_response(404)
      |> assert_schema("NotFound", api_spec)
    end

    test "should update the api key settings if they are configured and return the updated settings",
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
        |> DateTime.add(100 * 360, :day)
        |> DateTime.to_date()
        |> Date.year_of_era()

      assert expire_year == expected_infinite_year
    end
  end
end
