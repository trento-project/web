defmodule TrentoWeb.OpenApi.V1.Schema.Health do
  @moduledoc """
  Healthcheck
  """
  alias OpenApiSpex.Operation
  alias OpenApiSpex.Schema

  require OpenApiSpex

  OpenApiSpex.schema(%Schema{
    title: "Health",
    type: :object,
    example: %{
      database: "pass"
    },
    properties: %{
      database: %Schema{
        description: "The status of the database connection",
        type: :string,
        enum: ["pass", "fail"]
      }
    }
  })

  def response do
    Operation.response(
      "Health",
      "application/json",
      __MODULE__
    )
  end
end
