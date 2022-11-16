defmodule TrentoWeb.HostControllerTest do
  use TrentoWeb.ConnCase, async: true

  import OpenApiSpex.TestAssertions

  alias TrentoWeb.OpenApi.ApiSpec

  import Trento.Factory

  describe "list" do
    test "should list all hosts", %{conn: conn} do
      %{id: host_id} = insert(:host)

      insert_list(2, :sles_subscription, host_id: host_id)
      insert_list(2, :tag, resource_id: host_id)

      api_spec = ApiSpec.spec()

      get(conn, "/api/hosts")
      |> json_response(200)
      |> assert_schema("HostsCollection", api_spec)
    end
  end
end
