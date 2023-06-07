defmodule TrentoWeb.V1.HostControllerTest do
  use TrentoWeb.ConnCase, async: true

  import OpenApiSpex.TestAssertions

  alias TrentoWeb.OpenApi.V1.ApiSpec

  import Trento.Factory

  import Mox

  setup [:set_mox_from_context, :verify_on_exit!]

  setup do
    %{api_spec: ApiSpec.spec()}
  end

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

      assert %{
               "errors" => [
                 %{"detail" => "The requested resource cannot be found.", "title" => "Not Found"}
               ]
             } == resp
    end
  end

  describe "delete" do
    test "should send 204 response when successful host deletion", %{conn: conn} do
      %{id: host_id} = insert(:host)

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn %Trento.Domain.Commands.RequestHostDeregistration{host_id: ^host_id} ->
          :ok
        end
      )

      conn
      |> delete("/api/v1/hosts/#{host_id}")
      |> response(204)
    end

    test "should send 422 response if the host is still alive", %{conn: conn, api_spec: api_spec} do
      %{id: host_id} = insert(:host)

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn %Trento.Domain.Commands.RequestHostDeregistration{host_id: ^host_id} ->
          {:error, :host_alive}
        end
      )

      conn
      |> delete("/api/v1/hosts/#{host_id}")
      |> json_response(422)
      |> assert_schema("UnprocessableEntity", api_spec)
    end

    test "should return 404 if the host was not found", %{conn: conn, api_spec: api_spec} do
      %{id: host_id} = insert(:host)

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn %Trento.Domain.Commands.RequestHostDeregistration{host_id: ^host_id} ->
          {:error, :host_not_registered}
        end
      )

      conn
      |> delete("/api/v1/hosts/#{host_id}")
      |> json_response(404)
      |> assert_schema("NotFound", api_spec)
    end
  end
end
