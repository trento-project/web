defmodule TrentoWeb.OpenApi.V1.Schema.Chart do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule ChartTimeSeries do
    @moduledoc false
    OpenApiSpex.schema(
      %{
        title: "ChartTimeSeries",
        description:
          "A Time Series for a chart, has a series of float values distributed through time",
        type: :object,
        additionalProperties: false,
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
                  description: "ISO8601 timestamp"
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
      },
      struct?: false
    )
  end

  defmodule HostCpuChart do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "HostCpuChart",
        additionalProperties: false,
        description: "A Time Series chart with information about the cpu usage of a host",
        type: :object,
        properties: %{
          busy_iowait: ChartTimeSeries,
          busy_irqs: ChartTimeSeries,
          busy_other: ChartTimeSeries,
          busy_system: ChartTimeSeries,
          busy_user: ChartTimeSeries,
          idle: ChartTimeSeries
        }
      },
      struct?: false
    )
  end

  defmodule HostMemoryChart do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "HostMemoryChart",
        description: "A Time series chart with information about the memory usage of a host",
        type: :object,
        additionalProperties: false,
        properties: %{
          ram_total: ChartTimeSeries,
          ram_cache_and_buffer: ChartTimeSeries,
          ram_free: ChartTimeSeries,
          ram_used: ChartTimeSeries,
          swap_used: ChartTimeSeries
        }
      },
      struct?: false
    )
  end
end
