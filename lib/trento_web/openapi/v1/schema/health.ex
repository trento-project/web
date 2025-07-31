defmodule TrentoWeb.OpenApi.V1.Schema.Health do
  @moduledoc """
  Healthcheck
  """
  alias OpenApiSpex.Operation
  alias OpenApiSpex.Schema

  require OpenApiSpex

  OpenApiSpex.schema(
    %Schema{
      title: "Health",
      description: "Platform health check status response.",
      type: :object,
      example: %{
        database: "pass"
      },
      additionalProperties: false,
      properties: %{
        database: %Schema{
          description: "The status of the database connection.",
          type: :string,
          enum: ["pass", "fail"],
          example: "pass"
        }
      }
    },
    struct?: false
  )

  def response do
    Operation.response(
      "Health",
      "application/json",
      __MODULE__
    )
  end
end
