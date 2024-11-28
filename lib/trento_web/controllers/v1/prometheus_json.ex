defmodule TrentoWeb.V1.PrometheusJSON do
  def exporters_status(%{status: status}), do: status

  def targets(%{targets: targets}), do: Enum.flat_map(targets, &target(%{target: &1}))

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
