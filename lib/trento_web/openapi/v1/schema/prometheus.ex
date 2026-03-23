defmodule TrentoWeb.OpenApi.V1.Schema.Prometheus do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

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

  defmodule QueryRequest do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "PrometheusQueryRequestV1",
        description:
          "Request body for executing a PromQL query against Prometheus, scoped to a specific host.",
        type: :object,
        additionalProperties: false,
        required: [:query],
        example: %{
          "query" => "node_memory_MemTotal_bytes",
          "from" => "2024-01-15T10:00:00Z",
          "to" => "2024-01-15T12:00:00Z"
        },
        properties: %{
          query: %Schema{
            type: :string,
            description:
              "A PromQL query expression. The host's agentID label will be automatically injected into all vector selectors.",
            example: "node_memory_MemTotal_bytes"
          },
          time: %Schema{
            type: :string,
            format: :"date-time",
            description:
              "Evaluation timestamp for instant queries. If not provided, the current time will be used.",
            example: "2024-01-15T10:00:00Z"
          },
          from: %Schema{
            type: :string,
            format: :"date-time",
            description:
              "Start of the time range for range queries. When both 'from' and 'to' are provided, a range query is executed instead of an instant query.",
            example: "2024-01-15T10:00:00Z"
          },
          to: %Schema{
            type: :string,
            format: :"date-time",
            description:
              "End of the time range for range queries. Must be provided together with 'from'.",
            example: "2024-01-15T12:00:00Z"
          }
        }
      },
      struct?: false
    )
  end

  defmodule QueryResponse do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "PrometheusQueryResponseV1",
        description:
          "List of Prometheus query results. Each item contains a 'metric' map with label key-value pairs, " <>
            "and either a 'value' (for instant queries) or 'values' (for range queries) field with timestamped sample data.",
        type: :array,
        items: %Schema{
          type: :object,
          additionalProperties: true
        },
        example: [
          %{
            "metric" => %{"__name__" => "up", "agentID" => "abc-123"},
            "value" => [1_704_067_200, "1"]
          }
        ]
      },
      struct?: false
    )
  end
end
