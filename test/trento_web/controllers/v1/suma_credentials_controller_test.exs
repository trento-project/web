defmodule TrentoWeb.V1.SUMACredentialsControllerTest do
  use TrentoWeb.ConnCase, async: true

  import OpenApiSpex.TestAssertions

  import Trento.Factory

  alias TrentoWeb.OpenApi.V1.ApiSpec

  setup do
    %{api_spec: ApiSpec.spec()}
  end

  describe "retrieve user settings" do
    test "should return user settings", %{conn: conn} do
      insert(
        :software_updates_settings,
        [ca_cert: Faker.Lorem.sentence(), ca_uploaded_at: DateTime.utc_now()],
        conflict_target: :id,
        on_conflict: :replace_all
      )

      api_spec = ApiSpec.spec()

      conn
      |> get("/api/v1/settings/suma_credentials")
      |> json_response(:ok)
      |> assert_schema("SUMACredentials", api_spec)
    end

    test "should return 404 if no user settings have been saved", %{conn: conn} do
      api_spec = ApiSpec.spec()

      conn
      |> get("/api/v1/settings/suma_credentials")
      |> json_response(:not_found)
      |> assert_schema("NotFound", api_spec)
    end
  end

  describe "create new user settings" do
    test "should save new valid settings if no previous settings have been saved", %{conn: conn} do
      settings =
        %{url: url, username: username} = %{
          url: Faker.Internet.image_url(),
          username: Faker.Internet.user_name(),
          password: Faker.Lorem.word(),
          ca_cert: Faker.Lorem.sentence()
        }

      %{"ca_uploaded_at" => ca_uploaded_at} =
        resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/settings/suma_credentials", settings)
        |> json_response(:created)

      assert %{"url" => ^url, "username" => ^username} = resp
      refute ca_uploaded_at == nil
    end

    test "should not save settings if HTTP protocol provided in URL", %{conn: conn} do
      settings = %{
        url: "http://insecureurl.com",
        username: Faker.Internet.user_name(),
        password: Faker.Lorem.word(),
        ca_cert: Faker.Lorem.sentence()
      }

      resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/settings/suma_credentials", settings)
        |> json_response(:unprocessable_entity)

      assert %{
               "errors" => [
                 %{
                   "detail" => "can only be an https url",
                   "source" => %{"pointer" => "/url"},
                   "title" => "Invalid value"
                 }
               ]
             } == resp
    end

    test "should return 422 status if no body is provided in request", %{conn: conn} do
      resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/settings/suma_credentials", nil)
        |> json_response(:unprocessable_entity)

      assert %{
               "errors" => [
                 %{
                   "detail" => "Missing field: url",
                   "source" => %{"pointer" => "/url"},
                   "title" => "Invalid value"
                 },
                 %{
                   "detail" => "Missing field: username",
                   "source" => %{"pointer" => "/username"},
                   "title" => "Invalid value"
                 },
                 %{
                   "detail" => "Missing field: password",
                   "source" => %{"pointer" => "/password"},
                   "title" => "Invalid value"
                 }
               ]
             } == resp
    end

    test "should not save valid settings when previously settings have been saved", %{conn: conn} do
      insert(:software_updates_settings, [ca_cert: nil, ca_uploaded_at: nil],
        conflict_target: :id,
        on_conflict: :replace_all
      )

      new_settings = %{
        url: Faker.Internet.image_url(),
        username: Faker.Internet.user_name(),
        password: Faker.Lorem.word(),
        ca_cert: Faker.Lorem.sentence()
      }

      resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/settings/suma_credentials", new_settings)
        |> json_response(:unprocessable_entity)

      assert %{
               "errors" => [
                 %{
                   "detail" => "Credentials have already been set.",
                   "title" => "Unprocessable Entity"
                 }
               ]
             } == resp
    end

    test "should not save invalid settings", %{conn: conn} do
      settings = %{
        url: Faker.Internet.image_url(),
        username: Faker.Internet.user_name()
      }

      resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/settings/suma_credentials", settings)
        |> json_response(:unprocessable_entity)

      assert %{
               "errors" => [
                 %{
                   "detail" => "Missing field: password",
                   "source" => %{"pointer" => "/password"},
                   "title" => "Invalid value"
                 }
               ]
             } == resp
    end
  end

  describe "Clear user settings" do
    test "should return 204 if no user settings have previously been saved", %{conn: conn} do
      conn = delete(conn, "/api/v1/settings/suma_credentials")

      assert response(conn, 204) == ""
    end

    test "should return 204 when user settings have previously been saved", %{conn: conn} do
      insert(:software_updates_settings)

      conn = delete(conn, "/api/v1/settings/suma_credentials")

      assert response(conn, 204) == ""
    end
  end
end
