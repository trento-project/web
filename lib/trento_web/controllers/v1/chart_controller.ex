defmodule TrentoWeb.V1.ChartController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias TrentoWeb.OpenApi.V1.Schema

  alias Trento.Charts

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  tags ["Charts"]

  operation :host_cpu,
    summary: "Get a CPU chart of an host",
    description:
      "Get information about cpu usage for an host, providing a from/to interval as unix timestamp",
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
        description: "Start of the chart interval, as unix timestamp",
        type: %OpenApiSpex.Schema{
          type: :integer,
          description: "Start of the chart interval, as unix timestamp"
        }
      ],
      to: [
        in: :query,
        required: true,
        description: "End of the chart interval, as unix timestamp",
        type: %OpenApiSpex.Schema{
          type: :integer,
          description: "End of the chart interval, as unix timestamp"
        }
      ]
    ],
    responses: [
      ok:
        {"Informations about cpu usage of the host", "application/json",
         Schema.Chart.HostCpuChart}
    ]

  def host_cpu(conn, %{id: id, from: from, to: to}) do
    with {:ok, chart} <- Charts.host_cpu_chart(id, from, to) do
      render(conn, "host_cpu_chart.json", chart: chart)
    end
  end

  operation :host_memory,
    summary: "Get a Memory chart of an host",
    description:
      "Get information about memory usage for an host, providing a from/to interval as unix timestamp",
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
        description: "Start of the chart interval, as unix timestamp",
        type: %OpenApiSpex.Schema{
          type: :integer,
          description: "Start of the chart interval, as unix timestamp"
        }
      ],
      to: [
        in: :query,
        required: true,
        description: "End of the chart interval, as unix timestamp",
        type: %OpenApiSpex.Schema{
          type: :integer,
          description: "End of the chart interval, as unix timestamp"
        }
      ]
    ],
    responses: [
      ok:
        {"Informations about memory usage of the host", "application/json",
         Schema.Chart.HostMemoryChart}
    ]

  def host_memory(conn, %{id: id, from: from, to: to}) do
    with {:ok, chart} <- Charts.host_memory_chart(id, from, to) do
      render(conn, "host_memory_chart.json", chart: chart)
    end
  end
end
