defmodule TrentoWeb.V1.PrometheusJSON do
  @node_exporter_port 9100
  @node_exporter_name "Node Exporter"

  def targets(%{targets: targets}) do
    Enum.map(targets, &target(%{target: &1}))
  end

  def target(%{target: target}) do
    %{
      targets: ["#{List.first(target.ip_addresses, target.hostname)}:#{@node_exporter_port}"],
      labels: %{
        # TODO: in the future renaeme this label which also is used by node_exporter json
        agentID: "#{target.id}",
        hostname: "#{target.hostname}",
        exporter_name: @node_exporter_name
      }
    }
  end

  def exporters_status(%{status: status}), do: status
end
