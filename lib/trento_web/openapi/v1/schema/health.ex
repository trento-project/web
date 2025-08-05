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
      description:
        "Represents the status response for a platform health check, including the state of critical system components such as the database.",
      type: :object,
      example: %{
        database: "pass"
      },
      additionalProperties: false,
      properties: %{
        database: %Schema{
          description:
            "Indicates the current status of the database connection, showing whether the platform can access its data store successfully.",
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
      "A detailed health check response indicating the status of platform components, including database connectivity and overall system health.",
      "application/json",
      __MODULE__
    )
  end
end
