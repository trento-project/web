defmodule TrentoWeb.V1.PrometheusController do
  use TrentoWeb, :controller

  use OpenApiSpex.ControllerSpecs

  alias Trento.Integration.Prometheus

  alias TrentoWeb.OpenApi.V1.Schema

  require Logger

  action_fallback TrentoWeb.FallbackController

  operation :targets,
    summary: "Get Prometheus exporters targets",
    tags: ["Target Infrastructure"],
    description: "Get Prometheus targets with the Http Discovery format",
    responses: [
      ok: {"A collection of HttpSTD targets", "application/json", Schema.HttpStd.TargetList}
    ]

  def targets(conn, _) do
    targets = Prometheus.get_targets()

    render(conn, "targets.json", targets: targets)
  end

  operation :exporters_status,
    summary: "Get prometheus exporters status",
    tags: ["Target Infrastructure"],
    description: "Get Prometheus exporters status for a host identified by host id",
    responses: [
      ok:
        {"The status for the prometheus exporter", "application/json",
         Schema.Prometheus.ExporterStatus},
      not_found: Schema.NotFound.response()
    ]

  def exporters_status(conn, %{"id" => host_id}) do
    with {:ok, exporters_status} <- Prometheus.get_exporters_status(host_id) do
      render(conn, "exporters_status.json", status: exporters_status)
    end
  end
end
