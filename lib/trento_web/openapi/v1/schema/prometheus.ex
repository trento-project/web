defmodule TrentoWeb.OpenApi.V1.Schema.Prometheus do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule ExporterStatus do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "PrometheusExporterStatus",
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
