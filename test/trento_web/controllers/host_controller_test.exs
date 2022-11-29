defmodule TrentoWeb.HostControllerTest do
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

      get(conn, "/api/hosts")
      |> json_response(200)
      |> assert_schema("HostsCollection", api_spec)
    end
  end

  describe "heartbeat" do
    test "heartbeat action should return 400 when the request is malformed", %{conn: conn} do
      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn _ ->
          {:error, "the reason is you"}
        end
      )

      resp =
        conn
        |> post("/api/hosts/#{Faker.UUID.v4()}/heartbeat")
        |> json_response(:bad_request)

      assert %{"error" => "the reason is you"} = resp
    end
  end
end
