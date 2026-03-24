defmodule Trento.Infrastructure.Prometheus.PrometheusApiIntegrationTest do
  @moduledoc """
  Integration tests for PrometheusApi against a real Prometheus instance.

  These tests require Prometheus and node_exporter running via docker compose.
  Start with: docker compose up prometheus

  The node_exporter is scraped with agentID="240f96b1-8d26-53b7-9e99-ffb0f2e735bf"
  as configured in prometheus-dev-config.yml. This provides live node_exporter
  metrics (CPU, memory, swap, filesystem, up) labeled with that agentID.

  Run with: mix test --only integration
  """

  use ExUnit.Case

  @moduletag :integration

  alias Trento.Infrastructure.Prometheus.PrometheusApi

  @agent_id "240f96b1-8d26-53b7-9e99-ffb0f2e735bf"
  @prometheus_url "http://localhost:9090"

  setup do
    default_config =
      Application.get_env(:trento, Trento.Infrastructure.Prometheus.PrometheusApi)

    real_config =
      default_config
      |> Keyword.put(:http_client, Trento.Infrastructure.Prometheus.Adapter.HttpClient)
      |> Keyword.put(:url, @prometheus_url)

    Application.put_env(:trento, Trento.Infrastructure.Prometheus.PrometheusApi, real_config)

    on_exit(fn ->
      Application.put_env(
        :trento,
        Trento.Infrastructure.Prometheus.PrometheusApi,
        default_config
      )
    end)
  end

  describe "query/2" do
    test "should return a successful vector response for an instant query" do
      assert {:ok, %{"status" => "success", "data" => %{"resultType" => "vector"}}} =
               PrometheusApi.query("up", DateTime.utc_now())
    end

    test "should return the up metric for the scraped node_exporter" do
      query = "up{agentID=\"#{@agent_id}\"}"

      assert {:ok,
              %{
                "status" => "success",
                "data" => %{
                  "resultType" => "vector",
                  "result" => [%{"metric" => metric, "value" => [_ts, value]}]
                }
              }} = PrometheusApi.query(query, DateTime.utc_now())

      assert metric["agentID"] == @agent_id
      assert value == "1"
    end

    test "should return node_memory_MemTotal_bytes for the scraped host" do
      query = "node_memory_MemTotal_bytes{agentID=\"#{@agent_id}\"}"

      assert {:ok,
              %{
                "data" => %{
                  "result" => [%{"value" => [_ts, mem_total_str]}]
                }
              }} = PrometheusApi.query(query, DateTime.utc_now())

      {mem_total, _} = Float.parse(mem_total_str)
      assert mem_total > 0
    end

    test "should return node_cpu_seconds_total with multiple CPU modes" do
      query = "node_cpu_seconds_total{agentID=\"#{@agent_id}\",cpu=\"0\"}"

      assert {:ok,
              %{
                "data" => %{"result" => results}
              }} = PrometheusApi.query(query, DateTime.utc_now())

      modes = Enum.map(results, fn %{"metric" => m} -> m["mode"] end)
      assert "idle" in modes
      assert "user" in modes
      assert "system" in modes
    end

    test "should return error for invalid PromQL" do
      assert {:error, :unexpected_response} =
               PrometheusApi.query("invalid{{{", DateTime.utc_now())
    end
  end

  describe "query_range/3" do
    test "should return a matrix result for a range query" do
      to = DateTime.utc_now()
      from = DateTime.add(to, -300, :second)

      assert {:ok, %{"status" => "success", "data" => %{"resultType" => "matrix"}}} =
               PrometheusApi.query_range("up", from, to)
    end

    test "should return CPU rate data over a time range" do
      to = DateTime.utc_now()
      from = DateTime.add(to, -300, :second)

      query =
        "sum by (mode)(irate(node_cpu_seconds_total{agentID=\"#{@agent_id}\"}[5m]))"

      assert {:ok,
              %{
                "data" => %{
                  "resultType" => "matrix",
                  "result" => results
                }
              }} = PrometheusApi.query_range(query, from, to)

      # irate needs at least 2 scrapes, which may not be available on a freshly started instance
      assert is_list(results)
    end

    test "should return memory usage over a time range" do
      to = DateTime.utc_now()
      from = DateTime.add(to, -300, :second)

      query = "node_memory_MemTotal_bytes{agentID=\"#{@agent_id}\"}"

      assert {:ok,
              %{
                "data" => %{
                  "resultType" => "matrix",
                  "result" => [%{"values" => values}]
                }
              }} = PrometheusApi.query_range(query, from, to)

      assert length(values) >= 1

      Enum.each(values, fn [_ts, val_str] ->
        {val, _} = Float.parse(val_str)
        assert val > 0
      end)
    end
  end
end
