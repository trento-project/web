defmodule TrentoWeb.OpenApi.ApiSpecTest do
  use ExUnit.Case

  alias TrentoWeb.OpenApi.ApiSpec

  defmodule TestController do
    use Phoenix.Controller
    use OpenApiSpex.ControllerSpecs

    operation :show,
      summary: "Dummy show"

    def show(_, _), do: nil
  end

  defmodule TestRouter do
    use Phoenix.Router

    scope "/api" do
      get "/not_versioned", TestController, :show
      get "/v1/route", TestController, :show
      get "/v2/route", TestController, :show
    end

    def available_api_versions, do: ["v2", "v1"]
  end

  defmodule V1 do
    use ApiSpec,
      api_version: "v1"
  end

  defmodule V2 do
    use ApiSpec,
      api_version: "v2"
  end

  defmodule Unversioned do
    use ApiSpec,
      api_version: "unversioned"
  end

  defmodule Complete do
    use ApiSpec,
      api_version: "complete"
  end

  describe "ApiSpec" do
    test "should render only the v1 version routes" do
      expected_version = get_app_version() <> "-v1"

      assert %OpenApiSpex.OpenApi{
               info: %{
                 version: ^expected_version
               },
               paths: %{"/api/v1/route" => _}
             } = V1.spec(TestRouter)
    end

    test "should render only the v2 version routes" do
      expected_version = get_app_version() <> "-v2"

      assert %OpenApiSpex.OpenApi{
               info: %{
                 version: ^expected_version
               },
               paths: %{"/api/v2/route" => _}
             } = V2.spec(TestRouter)
    end

    test "should render unversioned routes" do
      expected_version = get_app_version() <> "-unversioned"

      assert %OpenApiSpex.OpenApi{
               info: %{
                 version: ^expected_version
               },
               paths: %{"/api/not_versioned" => _}
             } = Unversioned.spec(TestRouter)
    end

    test "should render the complete specification with all routes" do
      expected_version = get_app_version()

      assert %OpenApiSpex.OpenApi{
               info: %{
                 version: ^expected_version
               },
               paths: %{"/api/not_versioned" => _, "/api/v1/route" => _, "/api/v2/route" => _}
             } = Complete.spec(TestRouter)
    end
  end

  defp get_app_version(), do: to_string(Application.spec(:trento, :vsn))
end
