defmodule TrentoWeb.ClusterControllerTest do
  use TrentoWeb.ConnCase, async: true

  import OpenApiSpex.TestAssertions

  alias TrentoWeb.OpenApi.ApiSpec

  import Trento.Factory

  import Mox

  setup [:set_mox_from_context, :verify_on_exit!]

  describe "list" do
    test "should list all clusters", %{conn: conn} do
      insert_list(2, :cluster)

      api_spec = ApiSpec.spec()

      conn
      |> get("/api/clusters")
      |> json_response(200)
      |> assert_schema("PacemakerClustersCollection", api_spec)
    end
  end

  describe "select_checks" do
    test "should return bad request when the request is malformed", %{conn: conn} do
      cluster_id = UUID.uuid4()

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn _ ->
          {:error, "the reason is you"}
        end
      )

      resp =
        conn
        |> post("/api/clusters/#{cluster_id}/checks", %{
          "cluster_id" => cluster_id,
          "checks" => []
        })
        |> json_response(400)

      assert %{"error" => "the reason is you"} = resp
    end
  end

  describe "request check executions" do
    test "should return 400 with not found when the cluster is not known", %{conn: conn} do
      cluster_id = UUID.uuid4()

      resp =
        conn
        |> post("/api/clusters/#{cluster_id}/checks/request_execution", %{
          "cluster_id" => cluster_id
        })
        |> json_response(400)

      assert %{"error" => "cluster_not_found"} = resp
    end

    test "should return 400 when the request is invalid", %{conn: conn} do
      %{id: cluster_id} = insert(:cluster)

      expect(
        Trento.Integration.Checks.Mock,
        :request_execution,
        fn _, _, _, _, _ ->
          {:error, "the reason is us"}
        end
      )

      resp =
        conn
        |> post("/api/clusters/#{cluster_id}/checks/request_execution", %{
          "cluster_id" => cluster_id
        })
        |> json_response(400)

      assert %{"error" => "the reason is us"} = resp
    end
  end
end
