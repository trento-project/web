defmodule Trento.Infrastructure.Prometheus.PrometheusApiTest do
  use ExUnit.Case
  use Trento.DataCase

  import Mox
  import Trento.Factory

  alias Trento.Charts.ChartTimeSeriesSample
  alias Trento.Infrastructure.Prometheus.Adapter.HttpClient.Mock
  alias Trento.Infrastructure.Prometheus.PrometheusApi
  alias Trento.Repo

  setup_all do
    Mox.verify_on_exit!()
  end

  test "should return not found is the host is not registered" do
    assert {:error, :not_found} == PrometheusApi.get_exporters_status(Faker.UUID.v4())
  end

  describe "get_exporters_status with expected exporters" do
    setup do
      Application.put_env(
        :trento,
        Trento.Infrastructure.Prometheus.PrometheusApi,
        url: "http://localhost:9090",
        http_client: Mock
      )

      on_exit(fn ->
        Application.put_env(
          :trento,
          Trento.Infrastructure.Prometheus.PrometheusApi,
          url: "http://localhost:9090"
        )
      end)
    end

    test "expected exporters not present in query results are reported as critical" do
      host_id = Faker.UUID.v4()

      host =
        build(:host,
          id: host_id,
          prometheus_targets: %{
            "node_exporter" => "10.0.0.1:9100",
            "ha_cluster_exporter" => "10.0.0.1:9664"
          }
        )

      Repo.insert!(host)

      expect(Mock, :get, fn _url ->
        body =
          Jason.encode!(%{
            "data" => %{
              "result" => []
            }
          })

        {:ok, %HTTPoison.Response{status_code: 200, body: body}}
      end)

      assert {:ok,
              %{
                "node_exporter" => :critical,
                "ha_cluster_exporter" => :critical
              }} == PrometheusApi.get_exporters_status(host_id)
    end

    test "expected exporters present in query results use the queried status" do
      host_id = Faker.UUID.v4()

      host =
        build(:host,
          id: host_id,
          prometheus_targets: %{
            "node_exporter" => "10.0.0.1:9100",
            "ha_cluster_exporter" => "10.0.0.1:9664"
          }
        )

      Repo.insert!(host)

      expect(Mock, :get, fn _url ->
        body =
          Jason.encode!(%{
            "data" => %{
              "result" => [
                %{
                  "metric" => %{"exporter_name" => "node_exporter"},
                  "value" => ["1234567890", "1"]
                },
                %{
                  "metric" => %{"exporter_name" => "ha_cluster_exporter"},
                  "value" => ["1234567890", "1"]
                }
              ]
            }
          })

        {:ok, %HTTPoison.Response{status_code: 200, body: body}}
      end)

      assert {:ok,
              %{
                "node_exporter" => :passing,
                "ha_cluster_exporter" => :passing
              }} == PrometheusApi.get_exporters_status(host_id)
    end

    test "missing expected exporters are critical while queried ones retain parsed status" do
      host_id = Faker.UUID.v4()

      host =
        build(:host,
          id: host_id,
          prometheus_targets: %{
            "node_exporter" => "10.0.0.1:9100",
            "ha_cluster_exporter" => "10.0.0.1:9664",
            "sap_hana_exporter" => "10.0.0.1:9950"
          }
        )

      Repo.insert!(host)

      expect(Mock, :get, fn _url ->
        body =
          Jason.encode!(%{
            "data" => %{
              "result" => [
                %{
                  "metric" => %{"exporter_name" => "node_exporter"},
                  "value" => ["1234567890", "1"]
                },
                %{
                  "metric" => %{"exporter_name" => "ha_cluster_exporter"},
                  "value" => ["1234567890", "0"]
                }
              ]
            }
          })

        {:ok, %HTTPoison.Response{status_code: 200, body: body}}
      end)

      assert {:ok,
              %{
                "node_exporter" => :passing,
                "ha_cluster_exporter" => :critical,
                "sap_hana_exporter" => :critical
              }} == PrometheusApi.get_exporters_status(host_id)
    end

    test "host with nil prometheus_targets behaves as before without expected exporters" do
      host_id = Faker.UUID.v4()

      host = build(:host, id: host_id, prometheus_targets: nil)
      Repo.insert!(host)

      expect(Mock, :get, fn _url ->
        body =
          Jason.encode!(%{
            "data" => %{
              "result" => [
                %{
                  "metric" => %{"exporter_name" => "node_exporter"},
                  "value" => ["1234567890", "1"]
                }
              ]
            }
          })

        {:ok, %HTTPoison.Response{status_code: 200, body: body}}
      end)

      assert {:ok, %{"node_exporter" => :passing}} ==
               PrometheusApi.get_exporters_status(host_id)
    end

    test "unexpected exporters from query results are included alongside expected ones" do
      host_id = Faker.UUID.v4()

      host =
        build(:host,
          id: host_id,
          prometheus_targets: %{
            "node_exporter" => "10.0.0.1:9100"
          }
        )

      Repo.insert!(host)

      expect(Mock, :get, fn _url ->
        body =
          Jason.encode!(%{
            "data" => %{
              "result" => [
                %{
                  "metric" => %{"exporter_name" => "node_exporter"},
                  "value" => ["1234567890", "1"]
                },
                %{
                  "metric" => %{"exporter_name" => "extra_exporter"},
                  "value" => ["1234567890", "0"]
                }
              ]
            }
          })

        {:ok, %HTTPoison.Response{status_code: 200, body: body}}
      end)

      assert {:ok,
              %{
                "node_exporter" => :passing,
                "extra_exporter" => :critical
              }} == PrometheusApi.get_exporters_status(host_id)
    end
  end

  describe "host chart fetching" do
    setup do
      %{
        prometheus_chart_agent_id: "7cd181e4-0c3e-5b70-9e47-e7ed8063b1d4",
        from: DateTime.from_unix!(1_702_316_008),
        to: DateTime.from_unix!(1_702_316_102)
      }
    end

    test "should get num_cpus", %{
      from: from,
      to: to
    } do
      assert {:ok, 12} == PrometheusApi.num_cpus(from, to)
    end

    test "should return no samples when no data is found", %{
      from: from,
      to: to
    } do
      assert {:ok, []} == PrometheusApi.cpu_busy_irqs(Faker.UUID.v4(), from, to)
    end

    test "should get cpu_busy_irqs data", %{
      prometheus_chart_agent_id: prometheus_chart_agent_id,
      from: from,
      to: to
    } do
      assert {:ok,
              [
                %ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:34:28.000000Z],
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
                %ChartTimeSeriesSample{timestamp: ~U[2023-12-11 17:34:28.000000Z], value: 0.0},
                %ChartTimeSeriesSample{timestamp: ~U[2023-12-11 17:33:28.000000Z], value: 0.0}
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
                  timestamp: ~U[2023-12-11 17:34:28.000000Z],
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
                  timestamp: ~U[2023-12-11 17:34:28.000000Z],
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
                  timestamp: ~U[2023-12-11 17:34:28.000000Z],
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
                %Trento.Charts.ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:34:28.000000Z],
                  value: 35.266666666666616
                },
                %Trento.Charts.ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:33:28.000000Z],
                  value: 42.13333333333329
                }
              ]} == PrometheusApi.cpu_busy_system(prometheus_chart_agent_id, from, to)
    end

    test "should get ram_total data", %{
      prometheus_chart_agent_id: prometheus_chart_agent_id,
      from: from,
      to: to
    } do
      assert {:ok,
              [
                %ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:34:28.000000Z],
                  value: 33_336_860_672.0
                },
                %ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:33:28.000000Z],
                  value: 33_336_860_672.0
                }
              ]} == PrometheusApi.ram_total(prometheus_chart_agent_id, from, to)
    end

    test "should get ram_used data", %{
      prometheus_chart_agent_id: prometheus_chart_agent_id,
      from: from,
      to: to
    } do
      assert {:ok,
              [
                %ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:34:28.000000Z],
                  value: 12_179_324_928.0
                },
                %ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:33:28.000000Z],
                  value: 12_157_894_656.0
                }
              ]} == PrometheusApi.ram_used(prometheus_chart_agent_id, from, to)
    end

    test "should get ram_cache_and_buffer data", %{
      prometheus_chart_agent_id: prometheus_chart_agent_id,
      from: from,
      to: to
    } do
      assert {:ok,
              [
                %ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:34:28.000000Z],
                  value: 12_311_339_008.0
                },
                %ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:33:28.000000Z],
                  value: 12_311_191_552.0
                }
              ]} == PrometheusApi.ram_cache_and_buffer(prometheus_chart_agent_id, from, to)
    end

    test "should get ram_free data", %{
      prometheus_chart_agent_id: prometheus_chart_agent_id,
      from: from,
      to: to
    } do
      assert {:ok,
              [
                %ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:34:28.000000Z],
                  value: 8_846_196_736.0
                },
                %ChartTimeSeriesSample{
                  timestamp: ~U[2023-12-11 17:33:28.000000Z],
                  value: 8_867_774_464.0
                }
              ]} == PrometheusApi.ram_free(prometheus_chart_agent_id, from, to)
    end

    test "should get swap_used data", %{
      prometheus_chart_agent_id: prometheus_chart_agent_id,
      from: from,
      to: to
    } do
      assert {:ok,
              [
                %ChartTimeSeriesSample{timestamp: ~U[2023-12-11 17:34:28.000000Z], value: 0.0},
                %ChartTimeSeriesSample{timestamp: ~U[2023-12-11 17:33:28.000000Z], value: 0.0}
              ]} == PrometheusApi.swap_used(prometheus_chart_agent_id, from, to)
    end
  end
end
