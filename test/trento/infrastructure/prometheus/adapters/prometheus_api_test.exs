defmodule Trento.Infrastructure.Prometheus.PrometheusApiTest do
  use ExUnit.Case
  use Trento.DataCase

  import Mox
  import Trento.Factory

  alias Trento.Charts.ChartTimeSeriesSample
  alias Trento.Infrastructure.Prometheus.Adapter.HttpClient.Mock
  alias Trento.Infrastructure.Prometheus.PrometheusApi

  setup_all do
    Mox.verify_on_exit!()
  end

  defp setup_mocked_prometheus_api(_) do
    default_prometheus_config =
      Application.get_env(:trento, Trento.Infrastructure.Prometheus.PrometheusApi)

    test_prometheus_config = Keyword.put(default_prometheus_config, :http_client, Mock)

    Application.put_env(
      :trento,
      Trento.Infrastructure.Prometheus.PrometheusApi,
      test_prometheus_config
    )

    on_exit(fn ->
      Application.put_env(
        :trento,
        Trento.Infrastructure.Prometheus.PrometheusApi,
        default_prometheus_config
      )
    end)
  end

  test "should return not found is the host is not registered" do
    assert {:error, :not_found} == PrometheusApi.get_exporters_status(Faker.UUID.v4())
  end

  describe "get_exporters_status with expected exporters" do
    setup :setup_mocked_prometheus_api

    test "expected exporters not present in query results are reported as critical" do
      %{id: host_id} =
        insert(:host,
          prometheus_targets: %{
            "node_exporter" => "10.0.0.1:9100",
            "ha_cluster_exporter" => "10.0.0.1:9664"
          }
        )

      expect(Mock, :get, fn _url, _headers, _params ->
        body =
          Jason.encode!(%{
            "data" => %{
              "resultType" => "vector",
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
      %{id: host_id} =
        insert(:host,
          prometheus_targets: %{
            "node_exporter" => "10.0.0.1:9100",
            "ha_cluster_exporter" => "10.0.0.1:9664"
          }
        )

      expect(Mock, :get, fn _url, _headers, _params ->
        body =
          Jason.encode!(%{
            "data" => %{
              "resultType" => "vector",
              "result" => [
                %{
                  "metric" => %{"exporter_name" => "node_exporter"},
                  "value" => [1_234_567_890, "1"]
                },
                %{
                  "metric" => %{"exporter_name" => "ha_cluster_exporter"},
                  "value" => [1_234_567_890, "1"]
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
      %{id: host_id} =
        insert(:host,
          prometheus_targets: %{
            "node_exporter" => "10.0.0.1:9100",
            "ha_cluster_exporter" => "10.0.0.1:9664",
            "sap_hana_exporter" => "10.0.0.1:9950"
          }
        )

      expect(Mock, :get, fn _url, _headers, _params ->
        body =
          Jason.encode!(%{
            "data" => %{
              "resultType" => "vector",
              "result" => [
                %{
                  "metric" => %{"exporter_name" => "node_exporter"},
                  "value" => [1_234_567_890, "1"]
                },
                %{
                  "metric" => %{"exporter_name" => "ha_cluster_exporter"},
                  "value" => [1_234_567_890, "0"]
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
      %{id: host_id} = insert(:host, prometheus_targets: nil)

      expect(Mock, :get, fn _url, _headers, _params ->
        body =
          Jason.encode!(%{
            "data" => %{
              "resultType" => "vector",
              "result" => [
                %{
                  "metric" => %{"exporter_name" => "node_exporter"},
                  "value" => [1_234_567_890, "1"]
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
      %{id: host_id} =
        insert(:host,
          prometheus_targets: %{
            "node_exporter" => "10.0.0.1:9100"
          }
        )

      expect(Mock, :get, fn _url, _headers, _params ->
        body =
          Jason.encode!(%{
            "data" => %{
              "resultType" => "vector",
              "result" => [
                %{
                  "metric" => %{"exporter_name" => "node_exporter"},
                  "value" => [1_234_567_890, "1"]
                },
                %{
                  "metric" => %{"exporter_name" => "extra_exporter"},
                  "value" => [1_234_567_890, "0"]
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

  describe "filesystem data fetching" do
    setup :setup_mocked_prometheus_api

    test "should return devices sizes" do
      expect(Mock, :get, fn _url, _headers, _params ->
        body =
          Jason.encode!(%{
            "data" => %{
              "resultType" => "vector",
              "result" => [
                %{
                  "metric" => %{
                    "device" => "/dev/sda1"
                  },
                  "value" => [
                    1_773_147_729.150,
                    "1536576000"
                  ]
                },
                %{
                  "metric" => %{
                    "device" => "/dev/sda2"
                  },
                  "value" => [
                    1_773_147_729.150,
                    "2536576000"
                  ]
                },
                %{
                  "metric" => %{
                    "device" => "/dev/sda3"
                  },
                  "value" => [
                    1_773_147_729.150,
                    "3536576000"
                  ]
                }
              ]
            }
          })

        {:ok, %HTTPoison.Response{status_code: 200, body: body}}
      end)

      assert {:ok, sampled_metrics} = PrometheusApi.devices_size(Faker.UUID.v4())
      assert length(sampled_metrics) == 3

      assert Enum.all?(sampled_metrics, fn %{
                                             metric: %{"device" => _},
                                             sample: %ChartTimeSeriesSample{}
                                           } ->
               true
             end)
    end

    test "should return devices available bytes" do
      expect(Mock, :get, fn _url, _headers, _params ->
        body =
          Jason.encode!(%{
            "data" => %{
              "resultType" => "vector",
              "result" => [
                %{
                  "metric" => %{
                    "device" => "/dev/sda2"
                  },
                  "value" => [
                    1_773_147_729.150,
                    "536576000"
                  ]
                }
              ]
            }
          })

        {:ok, %HTTPoison.Response{status_code: 200, body: body}}
      end)

      assert {:ok, sampled_metrics} = PrometheusApi.devices_avail(Faker.UUID.v4())
      assert length(sampled_metrics) == 1

      assert [
               %{
                 metric: %{"device" => "/dev/sda2"},
                 sample: %ChartTimeSeriesSample{
                   timestamp: ~U[2026-03-10 13:02:09.000000Z],
                   value: 536_576_000.0
                 }
               }
             ] = sampled_metrics
    end

    test "should return file systems size" do
      expect(Mock, :get, fn _url, _headers, _params ->
        body =
          Jason.encode!(%{
            "data" => %{
              "resultType" => "vector",
              "result" => [
                %{
                  "metric" => %{
                    "device" => "/dev/sda2",
                    "fstype" => "brfs",
                    "mountpoint" => "/home"
                  },
                  "value" => [
                    1_773_147_729.150,
                    "536576000"
                  ]
                }
              ]
            }
          })

        {:ok, %HTTPoison.Response{status_code: 200, body: body}}
      end)

      assert {:ok, sampled_metrics} = PrometheusApi.filesystems_size(Faker.UUID.v4())
      assert length(sampled_metrics) == 1

      assert [
               %{
                 metric: %{
                   "device" => "/dev/sda2",
                   "fstype" => "brfs",
                   "mountpoint" => "/home"
                 },
                 sample: %ChartTimeSeriesSample{
                   timestamp: ~U[2026-03-10 13:02:09.000000Z],
                   value: 536_576_000.0
                 }
               }
             ] = sampled_metrics
    end

    test "should return file available bytes" do
      expect(Mock, :get, fn _url, _headers, _params ->
        body =
          Jason.encode!(%{
            "data" => %{
              "resultType" => "vector",
              "result" => [
                %{
                  "metric" => %{
                    "device" => "/dev/sda2",
                    "fstype" => "brfs",
                    "mountpoint" => "/home"
                  },
                  "value" => [
                    1_773_147_729.150,
                    "536576000"
                  ]
                }
              ]
            }
          })

        {:ok, %HTTPoison.Response{status_code: 200, body: body}}
      end)

      assert {:ok, sampled_metrics} = PrometheusApi.filesystems_avail(Faker.UUID.v4())
      assert length(sampled_metrics) == 1

      assert [
               %{
                 metric: %{
                   "device" => "/dev/sda2",
                   "fstype" => "brfs",
                   "mountpoint" => "/home"
                 },
                 sample: %ChartTimeSeriesSample{
                   timestamp: ~U[2026-03-10 13:02:09.000000Z],
                   value: 536_576_000.0
                 }
               }
             ] = sampled_metrics
    end

    test "should return total swap" do
      expect(Mock, :get, fn _url, _headers, _params ->
        body =
          Jason.encode!(%{
            "data" => %{
              "resultType" => "vector",
              "result" => [
                %{
                  "metric" => %{},
                  "value" => [
                    1_773_147_729.150,
                    "123456789"
                  ]
                }
              ]
            }
          })

        {:ok, %HTTPoison.Response{status_code: 200, body: body}}
      end)

      assert {:ok, sampled_metrics} = PrometheusApi.swap_total(Faker.UUID.v4())
      assert length(sampled_metrics) == 1

      assert [
               %{
                 metric: %{},
                 sample: %ChartTimeSeriesSample{
                   timestamp: ~U[2026-03-10 13:02:09.000000Z],
                   value: 123_456_789.0
                 }
               }
             ] = sampled_metrics
    end

    test "should return available swap" do
      expect(Mock, :get, fn _url, _headers, _params ->
        body =
          Jason.encode!(%{
            "data" => %{
              "resultType" => "vector",
              "result" => [
                %{
                  "metric" => %{},
                  "value" => [
                    1_773_147_729.150,
                    "123456789"
                  ]
                }
              ]
            }
          })

        {:ok, %HTTPoison.Response{status_code: 200, body: body}}
      end)

      assert {:ok, sampled_metrics} = PrometheusApi.swap_total(Faker.UUID.v4())
      assert length(sampled_metrics) == 1

      assert [
               %{
                 metric: %{},
                 sample: %ChartTimeSeriesSample{
                   timestamp: ~U[2026-03-10 13:02:09.000000Z],
                   value: 123_456_789.0
                 }
               }
             ] = sampled_metrics
    end
  end

  describe "error handling" do
    setup :setup_mocked_prometheus_api

    scenarios = [
      %{
        name: "error response",
        result: {:ok, %HTTPoison.Response{status_code: 500, body: ""}},
        expected_error: :unexpected_response
      },
      %{
        name: "unexpected successful response",
        result: {:ok, %HTTPoison.Response{status_code: 204, body: ""}},
        expected_error: :unexpected_response
      },
      %{
        name: "HTTP client error",
        result: {:error, %HTTPoison.Error{reason: :timeout}},
        expected_error: %HTTPoison.Error{reason: :timeout}
      }
    ]

    for %{name: name, result: result, expected_error: expected_error} <- scenarios do
      @scenario_result result
      @expected_error expected_error

      test "should handle error on query range, #{name}" do
        expect(Mock, :get, fn _url, _headers, _params -> @scenario_result end)

        assert {:error, @expected_error} =
                 PrometheusApi.cpu_idle(Faker.UUID.v4(), DateTime.utc_now(), DateTime.utc_now())
      end

      test "should handle error on simple query, #{name}" do
        expect(Mock, :get, fn _url, _headers, _params -> @scenario_result end)

        assert {:error, @expected_error} = PrometheusApi.filesystems_avail(Faker.UUID.v4())
      end
    end
  end
end
