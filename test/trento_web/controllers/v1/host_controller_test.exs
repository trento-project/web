defmodule TrentoWeb.V1.HostControllerTest do
  use TrentoWeb.ConnCase, async: true

  import OpenApiSpex.TestAssertions

  alias TrentoWeb.OpenApi.ApiSpec

  import Trento.Factory

  import Mox

  setup [:set_mox_from_context, :verify_on_exit!]

  describe "list" do
    test "should list all hosts", %{conn: conn} do
      %{id: host_id} = insert(:host)

      insert_list(2, :sles_subscription, host_id: host_id)
      insert_list(2, :tag, resource_id: host_id)

      api_spec = ApiSpec.spec()

      get(conn, "/api/v1/hosts")
      |> json_response(200)
      |> assert_schema("HostsCollection", api_spec)
    end
  end

  describe "heartbeat" do
    test "should return 404 if the host was not found", %{conn: conn} do
      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn _ ->
          {:error, :host_not_registered}
        end
      )

      resp =
        conn
        |> post("/api/v1/hosts/#{UUID.uuid4()}/heartbeat")
        |> json_response(:not_found)

      assert %{"errors" => [%{"detail" => "Host not found", "title" => "Not Found"}]} = resp
    end
  end
end
