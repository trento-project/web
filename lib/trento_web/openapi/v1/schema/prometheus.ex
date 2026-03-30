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
