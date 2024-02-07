defmodule TrentoWeb.V1.SUMACredentialsControllerTest do
  use TrentoWeb.ConnCase, async: true

  import OpenApiSpex.TestAssertions

  import Trento.Factory

  alias TrentoWeb.OpenApi.V1.ApiSpec

  setup do
    %{api_spec: ApiSpec.spec()}
  end

  describe "user settings" do
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
end
