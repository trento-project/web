defmodule TrentoWeb.OpenApi.Schema.Prometheus do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule ExporterStatus do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "PrometheusExporterStatus",
      type: :object,
      example: %{
        "Node exporter" => "critical"
      },
      additionalProperties: %Schema{
        enum: ["critical", "passing", "unknown"],
        description:
          "Status of the exporter, the value could be one of passing, critical, unknown",
        type: :string
      }
    })
  end
end
