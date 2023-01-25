defmodule TrentoWeb.PrometheusView do
  use TrentoWeb, :view

  @node_exporter_port 9100
  @node_exporter_name "Node Exporter"

  def render("targets.json", %{targets: targets}) do
    render_many(targets, __MODULE__, "target.json", as: :target)
  end

  def render("target.json", %{target: target}) do
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

  def render("exporters_status.json", %{status: status}), do: status
end
