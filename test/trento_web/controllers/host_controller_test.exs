defmodule TrentoWeb.HostControllerTest do
  use TrentoWeb.ConnCase, async: true

  import OpenApiSpex.TestAssertions

  alias TrentoWeb.OpenApi.ApiSpec

  import Trento.Factory

  describe "list" do
    test "should list all hosts", %{conn: conn} do
      0..2
      |> Enum.map(fn _ -> insert(:host) end)
      |> Enum.sort_by(& &1.hostname)

      api_spec = ApiSpec.spec()

      get(conn, Routes.host_path(conn, :list))
      |> json_response(200)
      |> assert_schema("HostsCollection", api_spec)
    end
  end
end
