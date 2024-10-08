defmodule TrentoWeb.V1.ChartController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias TrentoWeb.OpenApi.V1.Schema

  alias Trento.Charts

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  tags ["Charts"]

  operation :host_cpu,
    summary: "Get a CPU chart of a host",
    description:
      "Get information about cpu usage for a host, providing a from/to interval as ISO8601 timestamp",
    parameters: [
      id: [
        in: :path,
        required: true,
        description: "Host ID",
        type: %OpenApiSpex.Schema{type: :string, format: :uuid, description: "Host ID"}
      ],
      from: [
        in: :query,
        required: true,
        description: "Start of the chart interval, as ISO8601 timestamp",
        type: %OpenApiSpex.Schema{
          type: :string,
          format: :"date-time",
          description: "Start of the chart interval, as ISO8601 timestamp"
        }
      ],
      to: [
        in: :query,
        required: true,
        description: "End of the chart interval, as ISO8601 timestamp",
        type: %OpenApiSpex.Schema{
          type: :string,
          format: :"date-time",
          description: "End of the chart interval, as ISO8601 timestamp"
        }
      ]
    ],
    responses: [
      ok:
        {"Information about CPU usage of the host", "application/json", Schema.Chart.HostCpuChart}
    ]

  def host_cpu(conn, %{id: id, from: from, to: to}) do
    with {:ok, chart} <- Charts.host_cpu_chart(id, from, to) do
      render(conn, :host_cpu_chart, chart: chart)
    end
  end

  operation :host_memory,
    summary: "Get a Memory chart of a host",
    description:
      "Get information about memory usage for a host, providing a from/to interval as ISO8601 timestamp",
    parameters: [
      id: [
        in: :path,
        required: true,
        description: "Host ID",
        type: %OpenApiSpex.Schema{type: :string, format: :uuid, description: "Host ID"}
      ],
      from: [
        in: :query,
        required: true,
        description: "Start of the chart interval, as ISO8601 timestamp",
        type: %OpenApiSpex.Schema{
          type: :string,
          format: :"date-time",
          description: "Start of the chart interval, as ISO8601 timestamp"
        }
      ],
      to: [
        in: :query,
        required: true,
        description: "End of the chart interval, as ISO8601 timestamp",
        type: %OpenApiSpex.Schema{
          type: :string,
          format: :"date-time",
          description: "End of the chart interval, as ISO8601 timestamp"
        }
      ]
    ],
    responses: [
      ok:
        {"Information about memory usage of the host", "application/json",
         Schema.Chart.HostMemoryChart}
    ]

  def host_memory(conn, %{id: id, from: from, to: to}) do
    with {:ok, chart} <- Charts.host_memory_chart(id, from, to) do
      render(conn, :host_memory_chart, chart: chart)
    end
  end
end
