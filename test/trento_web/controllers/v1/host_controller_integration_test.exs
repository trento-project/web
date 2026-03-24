defmodule TrentoWeb.V1.HostControllerIntegrationTest do
  @moduledoc """
  Integration tests for the host metrics query endpoint against a real Prometheus instance.

  These tests require Prometheus and node_exporter running via docker compose.
  Start with: docker compose up prometheus

  The node_exporter is scraped with agentID="240f96b1-8d26-53b7-9e99-ffb0f2e735bf"
  as configured in prometheus-dev-config.yml.

  Run with: mix test --only integration
  """

  use TrentoWeb.ConnCase, async: false

  @moduletag :integration

  import Trento.Support.Helpers.AbilitiesTestHelper

  setup do
    default_prometheus_config =
      Application.get_env(:trento, Trento.Infrastructure.Prometheus)

    default_api_config =
      Application.get_env(:trento, Trento.Infrastructure.Prometheus.PrometheusApi)

    Application.put_env(:trento, Trento.Infrastructure.Prometheus,
      adapter: Trento.Infrastructure.Prometheus.PrometheusApi
    )

    Application.put_env(:trento, Trento.Infrastructure.Prometheus.PrometheusApi,
      url: "http://localhost:9090",
      http_client: Trento.Infrastructure.Prometheus.Adapter.HttpClient
    )

    on_exit(fn ->
      Application.put_env(
        :trento,
        Trento.Infrastructure.Prometheus,
        default_prometheus_config
      )

      Application.put_env(
        :trento,
        Trento.Infrastructure.Prometheus.PrometheusApi,
        default_api_config
      )
    end)
  end

  setup :setup_api_spec_v1
  setup :setup_user

  @agent_id "240f96b1-8d26-53b7-9e99-ffb0f2e735bf"

  describe "query_metrics instant queries" do
    test "should return the up metric for the host", %{conn: conn} do
      response =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/hosts/#{@agent_id}/metrics/query", %{"query" => "up"})
        |> json_response(200)

      assert [%{"metric" => metric, "value" => [_ts, "1"]}] = response
      assert metric["agentID"] == @agent_id
    end

    test "should return memory total for the host", %{conn: conn} do
      response =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/hosts/#{@agent_id}/metrics/query", %{
          "query" => "node_memory_MemTotal_bytes"
        })
        |> json_response(200)

      assert [%{"value" => [_ts, mem_total_str]}] = response
      {mem_total, _} = Float.parse(mem_total_str)
      assert mem_total > 0
    end

    test "should inject agentID and scope CPU metrics to the host", %{conn: conn} do
      results =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/hosts/#{@agent_id}/metrics/query", %{
          "query" => "node_cpu_seconds_total{cpu=\"0\"}"
        })
        |> json_response(200)

      assert length(results) > 0

      for %{"metric" => metric} <- results do
        assert metric["agentID"] == @agent_id
      end

      modes = Enum.map(results, fn %{"metric" => m} -> m["mode"] end)
      assert "idle" in modes
      assert "user" in modes
    end
  end

  describe "query_metrics range queries" do
    test "should return CPU rate data over a time range", %{conn: conn} do
      to = DateTime.utc_now()
      from = DateTime.add(to, -300, :second)

      results =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/hosts/#{@agent_id}/metrics/query", %{
          "query" => "sum by (mode)(irate(node_cpu_seconds_total[5m]))",
          "from" => DateTime.to_iso8601(from),
          "to" => DateTime.to_iso8601(to)
        })
        |> json_response(200)

      assert length(results) > 0
      modes = Enum.map(results, fn %{"metric" => m} -> m["mode"] end)
      assert "idle" in modes
    end

    test "should return memory data over a time range", %{conn: conn} do
      to = DateTime.utc_now()
      from = DateTime.add(to, -300, :second)

      results =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/hosts/#{@agent_id}/metrics/query", %{
          "query" => "node_memory_MemTotal_bytes",
          "from" => DateTime.to_iso8601(from),
          "to" => DateTime.to_iso8601(to)
        })
        |> json_response(200)

      assert [%{"values" => values}] = results
      assert length(values) > 0
    end
  end
end
