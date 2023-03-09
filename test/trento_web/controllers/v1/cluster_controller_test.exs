defmodule TrentoWeb.V1.ClusterControllerTest do
  use TrentoWeb.ConnCase, async: true

  import OpenApiSpex.TestAssertions
  import Mox
  import Trento.Factory

  alias TrentoWeb.OpenApi.ApiSpec

  setup [:set_mox_from_context, :verify_on_exit!]

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

      %{"errors" => [%{"detail" => "Cluster not found", "title" => "Not Found"}]} = resp
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
                   "detail" => "Something went wrong while triggering an Execution Request",
                   "title" => "Internal Server Error"
                 }
               ]
             } = resp
    end
  end
end
