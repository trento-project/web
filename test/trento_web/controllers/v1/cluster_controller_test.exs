defmodule TrentoWeb.V1.ClusterControllerTest do
  use TrentoWeb.ConnCase, async: true

  import OpenApiSpex.TestAssertions
  import Mox
  import Trento.Factory
  import Trento.Support.Helpers.AbilitiesTestHelper

  alias TrentoWeb.OpenApi.V1.ApiSpec

  alias Trento.Infrastructure.Checks.AMQP.Publisher

  setup [:set_mox_from_context, :verify_on_exit!]

  setup :setup_api_spec_v1
  setup :setup_user

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
    test "should perform the request when the user has all:cluster_checks_execution ability", %{
      conn: conn
    } do
      %{id: cluster_id} = insert(:cluster)

      %{id: user_id} = insert(:user)

      %{id: ability_id} = insert(:ability, name: "all", resource: "cluster_checks_execution")
      insert(:users_abilities, user_id: user_id, ability_id: ability_id)

      conn =
        conn
        |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
        |> put_req_header("content-type", "application/json")

      expect(
        Trento.Infrastructure.Messaging.Adapter.Mock,
        :publish,
        fn Publisher, _, _ ->
          :ok
        end
      )

      resp =
        conn
        |> post("/api/v1/clusters/#{cluster_id}/checks/request_execution")
        |> json_response(:accepted)

      assert resp == %{}
    end

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

    test "should return 422 when the selection is empty", %{conn: conn} do
      %{id: cluster_id} = insert(:cluster, selected_checks: [])

      resp =
        conn
        |> post("/api/v1/clusters/#{cluster_id}/checks/request_execution")
        |> json_response(:unprocessable_entity)

      assert %{
               "errors" => [
                 %{
                   "title" => "Unprocessable Entity",
                   "detail" => "No checks were selected for the target."
                 }
               ]
             } == resp
    end

    test "should return 500 if messaging returns an error", %{conn: conn} do
      expect(
        Trento.Infrastructure.Messaging.Adapter.Mock,
        :publish,
        fn Publisher, _, _ ->
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
          post(conn, "/api/v1/clusters/#{cluster_id}/checks", %{}),
          post(conn, "/api/v1/clusters/#{cluster_id}/checks/request_execution", %{})
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
