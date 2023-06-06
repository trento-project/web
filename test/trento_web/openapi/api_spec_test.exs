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

  describe "ApiSpec" do
    test "should render only the v1 version routes" do
      assert %OpenApiSpex.OpenApi{
               paths: %{"/api/not_versioned" => _, "/api/v1/route" => _}
             } = V1.spec(TestRouter)
    end

    test "should render only the v2 version routes" do
      assert %OpenApiSpex.OpenApi{
               paths: %{"/api/not_versioned" => _, "/api/v2/route" => _}
             } = V2.spec(TestRouter)
    end
  end
end
