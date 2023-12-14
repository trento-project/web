defmodule TrentoWeb.V1.ChartController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias TrentoWeb.OpenApi.V1.Schema

  alias Trento.Charts

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  operation :host_cpu,
    summary: "Get a CPU chart of an host",
    description:
      "Get informations about cpu usage for an host, providing a from/to interval as unix timestamp",
    parameters: [
      id: [
        in: :path,
        required: true,
        type: %OpenApiSpex.Schema{type: :string, format: :uuid}
      ],
      from: [
        in: :query,
        required: true,
        type: %OpenApiSpex.Schema{
          type: :integer,
          description: "Start of the chart interval, as unix timestamp"
        }
      ],
      to: [
        in: :query,
        required: true,
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
end
