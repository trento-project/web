defmodule TrentoWeb.V1.PrometheusController do
  use TrentoWeb, :controller

  use OpenApiSpex.ControllerSpecs

  alias Trento.Infrastructure.Prometheus

  alias TrentoWeb.OpenApi.V1.Schema

  require Logger

  action_fallback TrentoWeb.FallbackController

  operation :targets,
    summary: "Get Prometheus exporters targets.",
    tags: ["Target Infrastructure"],
    description: "Get Prometheus targets with the Http Discovery format.",
    responses: [
      ok: {"A collection of HttpSTD targets.", "application/json", Schema.HttpStd.TargetList}
    ]

  def targets(conn, _) do
    targets = Prometheus.get_targets()
    render(conn, :targets, targets: targets)
  end

  operation :exporters_status,
    summary: "Get prometheus exporters status.",
    tags: ["Target Infrastructure"],
    description: "Get Prometheus exporters status for a host identified by host id.",
    parameters: [
      id: [
        in: :path,
        description: "Host ID.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "d59523fc-0497-4b1e-9fdd-14aa7cda77f1"
        }
      ]
    ],
    responses: [
      ok:
        {"The status for the prometheus exporter.", "application/json",
         Schema.Prometheus.ExporterStatus},
      not_found: Schema.NotFound.response()
    ]

  def exporters_status(conn, %{"id" => host_id}) do
    with {:ok, exporters_status} <- Prometheus.get_exporters_status(host_id) do
      render(conn, :exporters_status, status: exporters_status)
    end
  end
end
