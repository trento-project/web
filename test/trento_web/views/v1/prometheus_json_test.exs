defmodule TrentoWeb.V1.PrometheusJSONTest do
  use ExUnit.Case

  import Trento.Factory

  alias TrentoWeb.V1.PrometheusJSON

  test "should render the targets of registered hosts" do
    host1 =
      build(:host,
        prometheus_targets: %{"exporter_1" => "10.0.0.1:9100", "exporter_2" => "10.0.0.1:9101"}
      )

    host2 = build(:host, prometheus_targets: %{"exporter_3" => "10.0.0.2:9100"})
    # old agent, testing for backward compatibility
    host3 = build(:host, prometheus_targets: nil, ip_addresses: ["10.0.0.3", "10.0.0.2"])

    expected_targets = [
      %{
        targets: ["10.0.0.1:9100"],
        labels: %{
          agentID: host1.id,
          hostname: host1.hostname,
          exporter_name: "exporter_1"
        }
      },
      %{
        targets: ["10.0.0.1:9101"],
        labels: %{
          agentID: host1.id,
          hostname: host1.hostname,
          exporter_name: "exporter_2"
        }
      },
      %{
        targets: ["10.0.0.2:9100"],
        labels: %{
          agentID: host2.id,
          hostname: host2.hostname,
          exporter_name: "exporter_3"
        }
      },
      %{
        targets: ["10.0.0.3:9100"],
        labels: %{
          agentID: host3.id,
          hostname: host3.hostname,
          exporter_name: "node_exporter"
        }
      }
    ]

    assert expected_targets ==
             PrometheusJSON.targets(%{targets: [host1, host2, host3]})
  end
end
