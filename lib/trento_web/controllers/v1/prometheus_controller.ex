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
    description:
      "Retrieves a list of Prometheus exporter targets in the Http Discovery format, supporting monitoring and integration with Prometheus for infrastructure observability.",
    responses: [
      ok:
        {"Comprehensive list of Prometheus exporter targets in Http Discovery format for infrastructure monitoring and integration.",
         "application/json", Schema.HttpStd.TargetList}
    ]

  def targets(conn, _) do
    targets = Prometheus.get_targets()
    render(conn, :targets, targets: targets)
  end

  operation :exporters_status,
    summary: "Get prometheus exporters status.",
    tags: ["Target Infrastructure"],
    description:
      "Returns the status of Prometheus exporters for a specific host, identified by its unique ID, supporting health monitoring and diagnostics for infrastructure components.",
    parameters: [
      id: [
        in: :path,
        description:
          "Unique identifier of the host for which Prometheus exporter status is requested. This value must be a valid UUID string.",
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
        {"Status information for Prometheus exporters on the specified host, supporting health monitoring and diagnostics.",
         "application/json", Schema.Prometheus.ExporterStatus},
      not_found: Schema.NotFound.response()
    ]

  def exporters_status(conn, %{"id" => host_id}) do
    with {:ok, exporters_status} <- Prometheus.get_exporters_status(host_id) do
      render(conn, :exporters_status, status: exporters_status)
    end
  end
end
