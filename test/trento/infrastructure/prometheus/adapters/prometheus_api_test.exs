defmodule Trento.Infrastructure.Prometheus.PrometheusApiTest do
  use ExUnit.Case
  use Trento.DataCase

  alias Trento.Infrastructure.Prometheus.PrometheusApi
  alias Trento.Charts.ChartTimeSeriesSample

  test "should return not found is the host is not registered" do
    assert {:error, :not_found} == PrometheusApi.get_exporters_status(Faker.UUID.v4())
  end

  describe "host chart fetching" do
    setup do
      %{
        prometheus_chart_agent_id: "7cd181e4-0c3e-5b70-9e47-e7ed8063b1d4",
        from: 1_702_316_008,
        to: 1_702_316_102
      }
    end

    test "should get cpu_busy_irqs data", %{
      prometheus_chart_agent_id: prometheus_chart_agent_id,
      from: from,
      to: to
    } do
      assert {:ok,
              [
                %ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:34:54.000000Z],
                  value: 10.283333333333312
                },
                %ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:34:11.000000Z],
                  value: 10.283333333333397
                },
                %ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:33:28.000000Z],
                  value: 10.783333333333319
                }
              ]} == PrometheusApi.cpu_busy_irqs(prometheus_chart_agent_id, from, to)
    end

    test "should get cpu_busy_other data", %{
      prometheus_chart_agent_id: prometheus_chart_agent_id,
      from: from,
      to: to
    } do
      assert {:ok,
              [
                %ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:34:54.000000Z],
                  value: 0
                },
                %ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:34:11.000000Z],
                  value: 0
                },
                %ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:33:28.000000Z],
                  value: 0
                }
              ]} == PrometheusApi.cpu_busy_other(prometheus_chart_agent_id, from, to)
    end

    test "should get cpu_busy_iowait data", %{
      prometheus_chart_agent_id: prometheus_chart_agent_id,
      from: from,
      to: to
    } do
      assert {:ok,
              [
                %ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:34:54.000000Z],
                  value: 0.5666666666666487
                },
                %ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:34:11.000000Z],
                  value: 0.7833333333333492
                },
                %ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:33:28.000000Z],
                  value: 1.44999999999999
                }
              ]} == PrometheusApi.cpu_busy_iowait(prometheus_chart_agent_id, from, to)
    end

    test "should get cpu_busy_user data", %{
      prometheus_chart_agent_id: prometheus_chart_agent_id,
      from: from,
      to: to
    } do
      assert {:ok,
              [
                %ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:34:54.000000Z],
                  value: 108.05000000000024
                },
                %ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:34:11.000000Z],
                  value: 114.18333333333293
                },
                %ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:33:28.000000Z],
                  value: 128.15000000000018
                }
              ]} == PrometheusApi.cpu_busy_user(prometheus_chart_agent_id, from, to)
    end

    test "should get cpu_idle data", %{
      prometheus_chart_agent_id: prometheus_chart_agent_id,
      from: from,
      to: to
    } do
      assert {:ok,
              [
                %ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:34:54.000000Z],
                  value: 1040.9166666666656
                },
                %ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:34:11.000000Z],
                  value: 1030.9166666666654
                },
                %ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:33:28.000000Z],
                  value: 1007.6000000000082
                }
              ]} == PrometheusApi.cpu_idle(prometheus_chart_agent_id, from, to)
    end

    test "should get cpu_busy_system data", %{
      prometheus_chart_agent_id: prometheus_chart_agent_id,
      from: from,
      to: to
    } do
      assert {:ok,
              [
                %ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:34:54.000000Z],
                  value: 31.233333333333352
                },
                %ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:34:11.000000Z],
                  value: 35.266666666666616
                },
                %ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:33:28.000000Z],
                  value: 42.13333333333329
                }
              ]} == PrometheusApi.cpu_busy_system(prometheus_chart_agent_id, from, to)
    end
  end
end
