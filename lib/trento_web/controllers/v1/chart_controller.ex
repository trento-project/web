defmodule TrentoWeb.V1.ChartController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias TrentoWeb.OpenApi.V1.Schema

  alias Trento.Charts

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  tags ["Charts"]

  operation :host_cpu,
    summary: "Get a CPU chart of a host.",
    description:
      "Get information about cpu usage for a host, providing a from/to interval as ISO8601 timestamp.",
    parameters: [
      id: [
        in: :path,
        required: true,
        description: "Host ID.",
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          description: "Host ID.",
          example: "c1a2b3c4-d5e6-7890-abcd-ef1234567890"
        }
      ],
      from: [
        in: :query,
        required: true,
        description: "Start of the chart interval, as ISO8601 timestamp.",
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :"date-time",
          description: "Start of the chart interval, as ISO8601 timestamp.",
          example: "2024-01-15T10:00:00Z"
        }
      ],
      to: [
        in: :query,
        required: true,
        description: "End of the chart interval, as ISO8601 timestamp.",
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :"date-time",
          description: "End of the chart interval, as ISO8601 timestamp.",
          example: "2024-01-15T12:00:00Z"
        }
      ]
    ],
    responses: [
      ok:
        {"Information about CPU usage of the host.", "application/json", Schema.Chart.HostCpuChart}
    ]

  def host_cpu(conn, %{id: id, from: from, to: to}) do
    with {:ok, chart} <- Charts.host_cpu_chart(id, from, to) do
      render(conn, :host_cpu_chart, chart: chart)
    end
  end

  operation :host_memory,
    summary: "Get a Memory chart of a host.",
    description:
      "Get information about memory usage for a host, providing a from/to interval as ISO8601 timestamp.",
    parameters: [
      id: [
        in: :path,
        required: true,
        description: "Host ID.",
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          description: "Host ID.",
          example: "c1a2b3c4-d5e6-7890-abcd-ef1234567890"
        }
      ],
      from: [
        in: :query,
        required: true,
        description: "Start of the chart interval, as ISO8601 timestamp.",
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :"date-time",
          description: "Start of the chart interval, as ISO8601 timestamp.",
          example: "2024-01-15T10:00:00Z"
        }
      ],
      to: [
        in: :query,
        required: true,
        description: "End of the chart interval, as ISO8601 timestamp.",
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :"date-time",
          description: "End of the chart interval, as ISO8601 timestamp.",
          example: "2024-01-15T12:00:00Z"
        }
      ]
    ],
    responses: [
      ok:
        {"Information about memory usage of the host.", "application/json",
         Schema.Chart.HostMemoryChart}
    ]

  def host_memory(conn, %{id: id, from: from, to: to}) do
    with {:ok, chart} <- Charts.host_memory_chart(id, from, to) do
      render(conn, :host_memory_chart, chart: chart)
    end
  end
end
