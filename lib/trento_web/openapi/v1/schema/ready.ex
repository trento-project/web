defmodule TrentoWeb.OpenApi.V1.Schema.Ready do
  @moduledoc """
  Ready
  """
  alias OpenApiSpex.Operation
  alias OpenApiSpex.Schema

  require OpenApiSpex

  OpenApiSpex.schema(
    %Schema{
      title: "Ready",
      description:
        "Represents the readiness status of the Trento Web platform, indicating whether the system is fully operational and available for use.",
      type: :object,
      example: %{
        ready: true
      },
      additionalProperties: false,
      properties: %{
        ready: %Schema{
          description:
            "Indicates if the Trento Web platform is fully operational and ready to serve requests, supporting system health monitoring.",
          type: :boolean
        }
      }
    },
    struct?: false
  )

  def response do
    Operation.response(
      "A detailed readiness response indicating whether the Trento Web platform is fully operational and available for use.",
      "application/json",
      __MODULE__
    )
  end
end
