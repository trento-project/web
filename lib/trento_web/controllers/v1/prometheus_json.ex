defmodule TrentoWeb.V1.PrometheusJSON do
  @node_exporter_port 9100
  @node_exporter_name "node_exporter"

  def exporters_status(%{status: status}), do: status

  def targets(%{targets: targets}), do: Enum.flat_map(targets, &target(%{target: &1}))

  # Support backward compatibility with older agents that don't send prometheus_targets
  def target(%{
        target: %{id: id, hostname: hostname, ip_addresses: ip_addresses, prometheus_targets: nil}
      }) do
    [
      %{
        targets: ["#{List.first(ip_addresses, hostname)}:#{@node_exporter_port}"],
        labels: %{
          agentID: "#{id}",
          hostname: "#{hostname}",
          exporter_name: @node_exporter_name
        }
      }
    ]
  end

  def target(%{target: %{id: id, hostname: hostname, prometheus_targets: prometheus_targets}}) do
    Enum.map(prometheus_targets, fn {exporter, target} ->
      %{
        targets: [target],
        labels: %{
          agentID: id,
          hostname: hostname,
          exporter_name: exporter
        }
      }
    end)
  end
end
