defmodule TrentoWeb.OpenApi.V1.Schema.Chart do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule ChartTimeSeries do
    @moduledoc false
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
                type: :string,
                format: "date-time",
                description: "ISO8601 timestamp",
                example: "2023-12-18T13:50:57.547Z"
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
    @moduledoc false

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

  defmodule HostMemoryChart do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "HostMemoryChart",
      description: "A Time series chart with information about the memory usage of an host",
      type: :object,
      properties: %{
        ram_total: ChartTimeSeries,
        ram_cache_and_buffer: ChartTimeSeries,
        ram_free: ChartTimeSeries,
        ram_used: ChartTimeSeries,
        swap_used: ChartTimeSeries
      }
    })
  end
end
