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

    test "should filter unregistered hosts", %{conn: conn} do
      %{id: host_id} = insert(:host)
      insert(:host, deregistered_at: DateTime.utc_now())

      insert_list(2, :sles_subscription, host_id: host_id)
      insert_list(2, :tag, resource_id: host_id)

      api_spec = ApiSpec.spec()

      conn = get(conn, "/api/v1/hosts")

      resp = json_response(conn, 200)

      assert length(resp) == 1
      assert [%{"id" => ^host_id}] = resp
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
        |> post("/api/v1/hosts/#{Faker.UUID.v4()}/heartbeat")
        |> json_response(:bad_request)

      assert %{"error" => "the reason is you"} = resp
    end
  end
end
