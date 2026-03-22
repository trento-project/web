defmodule TrentoWeb.V1.PrometheusControllerTest do
  use TrentoWeb.ConnCase, async: true

  alias TrentoWeb.OpenApi.V1.ApiSpec

  import OpenApiSpex.TestAssertions
  import Mox
  import Trento.Factory

  test "should return the expected targets excluding deregistered hosts", %{conn: conn} do
    insert(:host, deregistered_at: DateTime.utc_now())
    insert_list(2, :host)

    api_spec = ApiSpec.spec()

    response =
      conn
      |> get("/api/v1/prometheus/targets")
      |> json_response(200)

    targets_ids = Enum.map(response, &Map.get(&1, "labels")["agentID"])

    assert length(targets_ids) == 2
    assert_schema(response, "HttpSTDTargetListV1", api_spec)
  end

  test "should only return pull mode hosts and exclude push mode hosts", %{conn: conn} do
    %{id: pull_host_id} = insert(:host, prometheus_mode: :pull)
    insert(:host, prometheus_mode: :push)
    insert(:host, prometheus_mode: :pull, deregistered_at: DateTime.utc_now())

    response =
      conn
      |> get("/api/v1/prometheus/targets")
      |> json_response(200)

    targets_ids = Enum.map(response, &Map.get(&1, "labels")["agentID"])

    assert length(targets_ids) == 1
    assert pull_host_id in targets_ids
  end

  test "should return the exporters status", %{conn: conn} do
    expect(Trento.Infrastructure.Prometheus.Mock, :get_exporters_status, fn _ ->
      {:ok, %{"Node Exporter" => :passing}}
    end)

    response =
      conn
      |> get("/api/v1/hosts/#{Faker.UUID.v4()}/exporters_status")
      |> json_response(200)

    assert %{"Node Exporter" => "passing"} == response
  end

  test "should return 404 if the host is not registered", %{conn: conn} do
    expect(Trento.Infrastructure.Prometheus.Mock, :get_exporters_status, fn _ ->
      {:error, :not_found}
    end)

    response =
      conn
      |> get("/api/v1/hosts/#{Faker.UUID.v4()}/exporters_status")
      |> json_response(404)

    assert %{
             "errors" => [
               %{
                 "detail" => "The requested resource cannot be found.",
                 "title" => "Not Found"
               }
             ]
           } = response
  end

  test "should return a 500 if the exporters status cannot be fetched", %{conn: conn} do
    expect(Trento.Infrastructure.Prometheus.Mock, :get_exporters_status, fn _ ->
      {:error, :reason}
    end)

    response =
      conn
      |> get("/api/v1/hosts/#{Faker.UUID.v4()}/exporters_status")
      |> json_response(500)

    assert %{
             "errors" => [
               %{
                 "detail" => "Something went wrong.",
                 "title" => "Internal Server Error"
               }
             ]
           } = response
  end

  describe "metrics proxy" do
    setup do
      %{api_spec: ApiSpec.spec()}
    end

    test "should proxy an instant query successfully", %{conn: conn, api_spec: api_spec} do
      host_id = Faker.UUID.v4()

      prometheus_response = %{
        "status" => "success",
        "data" => %{
          "resultType" => "vector",
          "result" => [
            %{
              "metric" => %{"__name__" => "up", "agentID" => host_id},
              "value" => [1_702_316_008, "1"]
            }
          ]
        }
      }

      expect(Trento.Infrastructure.Prometheus.Mock, :proxy_query, fn ^host_id, params ->
        assert Map.has_key?(params, "query")
        {:ok, prometheus_response}
      end)

      response =
        conn
        |> get("/api/v1/hosts/#{host_id}/metrics?query=up")
        |> json_response(200)

      assert response == prometheus_response
      assert_schema(response, "PrometheusMetricsResponseV1", api_spec)
    end

    test "should proxy a range query successfully", %{conn: conn, api_spec: api_spec} do
      host_id = Faker.UUID.v4()

      prometheus_response = %{
        "status" => "success",
        "data" => %{
          "resultType" => "matrix",
          "result" => []
        }
      }

      expect(Trento.Infrastructure.Prometheus.Mock, :proxy_query, fn ^host_id, params ->
        assert params["start"] == "2023-12-11T17:00:00Z"
        assert params["end"] == "2023-12-11T18:00:00Z"
        assert params["step"] == "60s"
        {:ok, prometheus_response}
      end)

      response =
        conn
        |> get(
          "/api/v1/hosts/#{host_id}/metrics?query=up&start=2023-12-11T17:00:00Z&end=2023-12-11T18:00:00Z&step=60s"
        )
        |> json_response(200)

      assert response == prometheus_response
      assert_schema(response, "PrometheusMetricsResponseV1", api_spec)
    end

    test "should return 400 when query param is missing", %{conn: conn} do
      response =
        conn
        |> get("/api/v1/hosts/#{Faker.UUID.v4()}/metrics")
        |> json_response(400)

      assert %{
               "errors" => [
                 %{
                   "title" => "Bad Request",
                   "detail" => "Missing required query parameter: query"
                 }
               ]
             } = response
    end

    test "should return 502 when prometheus returns an error", %{conn: conn} do
      host_id = Faker.UUID.v4()

      expect(Trento.Infrastructure.Prometheus.Mock, :proxy_query, fn ^host_id, _params ->
        {:error, :unexpected_response}
      end)

      response =
        conn
        |> get("/api/v1/hosts/#{host_id}/metrics?query=up")
        |> json_response(502)

      assert %{"errors" => [%{"title" => "Bad Gateway"}]} = response
    end
  end
end
