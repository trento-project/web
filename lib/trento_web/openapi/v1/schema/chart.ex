defmodule TrentoWeb.OpenApi.V1.Schema.Chart do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule ChartTimeSeries do
    OpenApiSpex.schema(%{
      title: "ChartTimeSeries",
      description:
        "A Time Series for a chart, has a series of float values distributed through time",
      type: :object,
      properties: %{
        label: %Schema{type: :string, description: "The name of series"},
        series: %Schema{
          type: :array,
          description: "The values of the series",
          items: %Schema{
            type: :object,
            description: "A timestamp/value pair",
            properties: %{
              timestamp: %Schema{
                type: :integer,
                description: "Unix timestamp",
                example: 1_702_568_367_474
              },
              value: %Schema{
                type: :number,
                example: 270_396.2030,
                format: :float,
                description: "Float value"
              }
            }
          }
        }
      }
    })
  end

  defmodule HostCpuChart do
    OpenApiSpex.schema(%{
      title: "HostCpuChart",
      description: "A Time Series chart with information about the cpu usage of an host",
      type: :object,
      properties: %{
        busy_iowait: ChartTimeSeries,
        busy_irqs: ChartTimeSeries,
        busy_other: ChartTimeSeries,
        busy_system: ChartTimeSeries,
        busy_user: ChartTimeSeries,
        idle: ChartTimeSeries
      }
    })
  end
end
