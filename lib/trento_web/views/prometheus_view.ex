defmodule TrentoWeb.PrometheusView do
  use TrentoWeb, :view

  @node_exporter_port 9100
  @node_exporter_name "Node Exporter"

  def render("targets.json", %{hosts: hosts}) do
    render_many(hosts, __MODULE__, "target.json", as: :host)
  end

  def render("target.json", %{host: host}) do
    %{
      target: ["#{host.ssh_address}:#{@node_exporter_port}"],
      labels: %{
        # TODO: in the future renaeme this label which also is used by node_exporter json
        agentID: "#{host.id}",
        hostname: "#{host.hostname}",
        exporter_name: @node_exporter_name
      }
    }
  end

  def render("exporter_status.json", %{status: status}), do: status
end
