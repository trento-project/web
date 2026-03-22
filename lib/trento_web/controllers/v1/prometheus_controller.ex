defmodule TrentoWeb.V1.PrometheusController do
  use TrentoWeb, :controller

  use OpenApiSpex.ControllerSpecs

  alias Trento.Infrastructure.Prometheus

  alias TrentoWeb.OpenApi.V1.Schema

  require Logger

  action_fallback TrentoWeb.FallbackController

  operation :targets,
    summary: "Get Prometheus exporters targets.",
    tags: ["Target Infrastructure", "MCP"],
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
    tags: ["Target Infrastructure", "MCP"],
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

  operation :metrics,
    summary: "Proxy Prometheus metrics query for a host.",
    tags: ["Target Infrastructure", "MCP"],
    description:
      "Proxies a PromQL query to the configured Prometheus instance, automatically scoping it to the specified host by injecting the agentID label. Supports both instant and range queries.",
    parameters: [
      id: [
        in: :path,
        description: "Host ID (UUID).",
        required: true,
        schema: %OpenApiSpex.Schema{type: :string, format: :uuid}
      ],
      query: [
        in: :query,
        description: "PromQL query expression.",
        required: true,
        schema: %OpenApiSpex.Schema{type: :string}
      ],
      start: [
        in: :query,
        description: "Range query start timestamp (RFC3339 or Unix).",
        required: false,
        schema: %OpenApiSpex.Schema{type: :string}
      ],
      end: [
        in: :query,
        description: "Range query end timestamp (RFC3339 or Unix).",
        required: false,
        schema: %OpenApiSpex.Schema{type: :string}
      ],
      step: [
        in: :query,
        description: "Range query resolution step.",
        required: false,
        schema: %OpenApiSpex.Schema{type: :string}
      ],
      time: [
        in: :query,
        description: "Evaluation timestamp for instant queries.",
        required: false,
        schema: %OpenApiSpex.Schema{type: :string}
      ],
      timeout: [
        in: :query,
        description: "Evaluation timeout.",
        required: false,
        schema: %OpenApiSpex.Schema{type: :string}
      ]
    ],
    responses: [
      ok:
        {"Prometheus query response for the specified host.", "application/json",
         Schema.Prometheus.MetricsResponse},
      bad_request: Schema.BadRequest.response()
    ]

  def metrics(conn, %{"id" => _host_id} = params) when not is_map_key(params, "query") do
    conn
    |> put_status(:bad_request)
    |> put_view(json: TrentoWeb.ErrorJSON)
    |> render(:"400", reason: "Missing required query parameter: query")
  end

  def metrics(conn, %{"id" => host_id, "query" => _query} = params) do
    proxy_params = Map.take(params, ["query", "start", "end", "step", "time", "timeout"])

    case Prometheus.proxy_query(host_id, proxy_params) do
      {:ok, result} ->
        render(conn, :metrics, metrics: result)

      {:error, :unexpected_response} ->
        conn
        |> put_status(:bad_gateway)
        |> put_view(json: TrentoWeb.ErrorJSON)
        |> render(:"502")
    end
  end
end
