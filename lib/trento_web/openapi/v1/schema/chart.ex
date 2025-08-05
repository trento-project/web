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
          "Represents a time series for a chart, containing a sequence of float values distributed over time for visualization and analysis.",
        type: :object,
        additionalProperties: false,
        properties: %{
          label: %Schema{
            type: :string,
            description:
              "A descriptive label for the time series, used for identification in chart visualizations."
          },
          series: %Schema{
            type: :array,
            description:
              "A list of values representing the time series data points, each associated with a timestamp for trend analysis.",
            items: %Schema{
              type: :object,
              description:
                "Represents a data point in the time series, consisting of a timestamp and a corresponding float value.",
              properties: %{
                timestamp: %Schema{
                  type: :string,
                  format: "date-time",
                  description:
                    "The ISO8601 formatted timestamp indicating when the data point was recorded in the time series."
                },
                value: %Schema{
                  type: :number,
                  example: 270_396.2030,
                  format: :float,
                  description:
                    "The float value associated with the timestamp, representing the measured metric at that point in time."
                }
              }
            }
          }
        },
        example: %{
          label: "CPU Usage",
          series: [
            %{timestamp: "2024-01-15T10:00:00Z", value: 75.5},
            %{timestamp: "2024-01-15T10:01:00Z", value: 80.2}
          ]
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
        description:
          "Represents a time series chart that provides detailed information about the CPU usage of a host over a period of time.",
        type: :object,
        example: %{
          busy_iowait: %{
            label: "Busy (I/O wait)",
            series: [
              %{timestamp: "2024-01-15T10:00:00Z", value: 5.2},
              %{timestamp: "2024-01-15T10:01:00Z", value: 6.1}
            ]
          },
          busy_irqs: %{
            label: "Busy (IRQs)",
            series: [
              %{timestamp: "2024-01-15T10:00:00Z", value: 1.0},
              %{timestamp: "2024-01-15T10:01:00Z", value: 1.2}
            ]
          },
          busy_other: %{
            label: "Busy (Other)",
            series: [
              %{timestamp: "2024-01-15T10:00:00Z", value: 2.5},
              %{timestamp: "2024-01-15T10:01:00Z", value: 2.8}
            ]
          },
          busy_system: %{
            label: "Busy (System)",
            series: [
              %{timestamp: "2024-01-15T10:00:00Z", value: 15.3},
              %{timestamp: "2024-01-15T10:01:00Z", value: 16.1}
            ]
          },
          busy_user: %{
            label: "Busy (User)",
            series: [
              %{timestamp: "2024-01-15T10:00:00Z", value: 25.4},
              %{timestamp: "2024-01-15T10:01:00Z", value: 28.2}
            ]
          },
          idle: %{
            label: "Idle",
            series: [
              %{timestamp: "2024-01-15T10:00:00Z", value: 50.6},
              %{timestamp: "2024-01-15T10:01:00Z", value: 45.6}
            ]
          }
        },
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
        description:
          "Represents a time series chart that provides detailed information about the memory usage of a host over a period of time.",
        type: :object,
        additionalProperties: false,
        example: %{
          ram_total: %{
            label: "Total RAM",
            series: [
              %{timestamp: "2024-01-15T10:00:00Z", value: 16_777_216_000},
              %{timestamp: "2024-01-15T10:01:00Z", value: 16_777_216_000}
            ]
          },
          ram_cache_and_buffer: %{
            label: "Cache and Buffer",
            series: [
              %{timestamp: "2024-01-15T10:00:00Z", value: 2_147_483_648},
              %{timestamp: "2024-01-15T10:01:00Z", value: 2_147_483_648}
            ]
          },
          ram_free: %{
            label: "Free RAM",
            series: [
              %{timestamp: "2024-01-15T10:00:00Z", value: 4_294_967_296},
              %{timestamp: "2024-01-15T10:01:00Z", value: 4_194_967_296}
            ]
          },
          ram_used: %{
            label: "Used RAM",
            series: [
              %{timestamp: "2024-01-15T10:00:00Z", value: 10_485_760_000},
              %{timestamp: "2024-01-15T10:01:00Z", value: 10_585_760_000}
            ]
          },
          swap_used: %{
            label: "Used Swap",
            series: [
              %{timestamp: "2024-01-15T10:00:00Z", value: 1_073_741_824},
              %{timestamp: "2024-01-15T10:01:00Z", value: 1_073_741_824}
            ]
          }
        },
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
