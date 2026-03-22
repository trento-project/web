defmodule TrentoWeb.OpenApi.V1.Schema.Prometheus do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule MetricsResponse do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "PrometheusMetricsResponseV1",
        description: "Raw Prometheus query response proxied for a specific host.",
        type: :object,
        example: %{
          status: "success",
          data: %{
            resultType: "vector",
            result: [
              %{
                "metric" => %{"__name__" => "up", "instance" => "localhost:9090"},
                "value" => [1_616_000_000, "1"]
              }
            ]
          }
        },
        properties: %{
          status: %Schema{
            type: :string,
            description: "Prometheus response status.",
            example: "success"
          },
          data: %Schema{
            type: :object,
            description: "Prometheus response data.",
            properties: %{
              resultType: %Schema{
                type: :string,
                description: "Type of result.",
                example: "vector"
              },
              result: %Schema{
                type: :array,
                description: "Query result entries.",
                items: %Schema{type: :object}
              }
            }
          }
        }
      },
      struct?: false
    )
  end

  defmodule ExporterStatus do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "PrometheusExporterStatusV1",
        description:
          "Represents the status information for Prometheus exporters, indicating their health and operational state for monitoring purposes.",
        type: :object,
        example: %{
          "Node exporter" => "critical"
        },
        additionalProperties: %Schema{
          enum: [:critical, :passing, :unknown],
          description:
            "The health status of a Prometheus exporter, which can be 'passing', 'critical', or 'unknown', used to indicate monitoring and alerting conditions.",
          type: :string
        }
      },
      struct?: false
    )
  end
end
