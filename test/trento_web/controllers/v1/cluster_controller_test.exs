defmodule TrentoWeb.V1.ClusterControllerTest do
  use TrentoWeb.ConnCase, async: true

  import OpenApiSpex.TestAssertions
  import Mox
  import Trento.Factory

  alias TrentoWeb.OpenApi.V1.ApiSpec

  setup [:set_mox_from_context, :verify_on_exit!]

  setup %{conn: conn} do
    conn =
      conn
      |> Plug.Conn.put_private(:plug_session, %{})
      |> Plug.Conn.put_private(:plug_session_fetch, :done)
      |> Pow.Plug.put_config(otp_app: :trento)

    api_spec = ApiSpec.spec()

    # Default inject all:all abilities user. ability_id 1 is all:all
    %{id: user_id} = insert(:user)
    insert(:users_abilities, user_id: user_id, ability_id: 1)

    conn =
      Pow.Plug.assign_current_user(conn, %{"user_id" => user_id}, Pow.Plug.fetch_config(conn))

    {:ok, conn: put_req_header(conn, "accept", "application/json"), api_spec: api_spec}
  end

  describe "list" do
    test "should list all clusters", %{conn: conn} do
      insert_list(2, :cluster)

      api_spec = ApiSpec.spec()

      conn
      |> get("/api/v1/clusters")
      |> json_response(200)
      |> assert_schema("PacemakerClustersCollection", api_spec)
    end
  end

  describe "select_checks" do
    test "should return 202 when the checks were selected", %{conn: conn} do
      expect(Trento.Commanded.Mock, :dispatch, fn _ ->
        :ok
      end)

      cluster_id = UUID.uuid4()

      resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/clusters/#{cluster_id}/checks", %{
          "checks" => ["string"]
        })
        |> json_response(:accepted)

      assert %{} = resp
    end
  end

  describe "request check executions" do
    test "should return 404 when the cluster is not found", %{conn: conn} do
      cluster_id = UUID.uuid4()

      resp =
        conn
        |> post("/api/v1/clusters/#{cluster_id}/checks/request_execution", %{})
        |> json_response(:not_found)

      assert %{
               "errors" => [
                 %{"detail" => "The requested resource cannot be found.", "title" => "Not Found"}
               ]
             } == resp
    end

    test "should return 500 if messaging returns an error", %{conn: conn} do
      expect(
        Trento.Infrastructure.Messaging.Adapter.Mock,
        :publish,
        fn _, _ ->
          {:error, :amqp_error}
        end
      )

      %{id: cluster_id} = insert(:cluster)

      resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/clusters/#{cluster_id}/checks/request_execution", %{})
        |> json_response(:internal_server_error)

      assert %{
               "errors" => [
                 %{
                   "detail" => "Something went wrong.",
                   "title" => "Internal Server Error"
                 }
               ]
             } = resp
    end
  end

  describe "forbidden response" do
    test "should return forbidden on any controller action if the user does not have the right permission",
         %{conn: conn, api_spec: api_spec} do
      %{id: user_id} = insert(:user)
      %{id: cluster_id} = insert(:cluster)

      conn =
        conn
        |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
        |> put_req_header("content-type", "application/json")

      Enum.each(
        [
          post(conn, "/api/v1/clusters/#{cluster_id}/checks", %{})
        ],
        fn conn ->
          conn
          |> json_response(:forbidden)
          |> assert_schema("Forbidden", api_spec)
        end
      )
    end
  end
end
