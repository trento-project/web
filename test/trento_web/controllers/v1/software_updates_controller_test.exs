defmodule TrentoWeb.V1.SoftwareUpdatesControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Mox
  import OpenApiSpex.TestAssertions

  import Trento.Factory

  alias TrentoWeb.OpenApi.V1.ApiSpec

  setup [:set_mox_from_context, :verify_on_exit!]

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
      |> get("/api/v1/software_updates/settings")
      |> json_response(:ok)
      |> assert_schema("Settings", api_spec)
    end

    test "should return 404 if no user settings have been saved", %{conn: conn} do
      api_spec = ApiSpec.spec()

      conn
      |> get("/api/v1/software_updates/settings")
      |> json_response(:not_found)
      |> assert_schema("NotFound", api_spec)
    end
  end
end
