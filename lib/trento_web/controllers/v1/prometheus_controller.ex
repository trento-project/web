defmodule TrentoWeb.V1.PrometheusController do
  use TrentoWeb, :controller

  use OpenApiSpex.ControllerSpecs

  alias Trento.Integration.Prometheus

  require Logger

  action_fallback TrentoWeb.FallbackController

  operation :targets,
    summary: "Get Prometheus exporters targets",
    tags: ["Target Infrastructure"],
    description: "Get Prometheus targets with the Http Discovery format",
    responses: [
      ok:
        {"A collection of HttpSTD targets", "application/json",
         TrentoWeb.OpenApi.Schema.HttpStd.TargetList}
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
         TrentoWeb.OpenApi.Schema.Prometheus.ExporterStatus}
    ]

  def exporters_status(conn, %{"id" => host_id}) do
    case Prometheus.get_exporters_status(host_id) do
      {:ok, exporters_status} ->
        render(conn, "exporters_status.json", status: exporters_status)

      {:error, reason} ->
        Logger.error("Failed to get exporters status:", error: inspect(reason))

        {:error, {:internal_error, "An error occurred in getting exporters status."}}
    end
  end
end
