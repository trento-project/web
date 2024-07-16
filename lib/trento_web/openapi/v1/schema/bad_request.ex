defmodule TrentoWeb.OpenApi.V1.Schema.BadRequest do
  @moduledoc """
  Bad Request
  """

  require OpenApiSpex

  alias OpenApiSpex.Operation
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "BadRequest",
      type: :object,
      additionalProperties: false,
      properties: %{
        errors: %Schema{
          type: :array,
          items: %Schema{
            type: :object,
            properties: %{
              detail: %Schema{
                type: :string,
                example: "Invalid request payload."
              },
              title: %Schema{type: :string, example: "Bad Request"}
            }
          }
        }
      }
    },
    struct?: false
  )

  def response do
    Operation.response(
      "Bad Request",
      "application/json",
      __MODULE__
    )
  end
end
