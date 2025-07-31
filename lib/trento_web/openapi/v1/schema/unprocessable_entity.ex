defmodule TrentoWeb.OpenApi.V1.Schema.UnprocessableEntity do
  @moduledoc """
  422 - Unprocessable Entity.
  """
  require OpenApiSpex

  alias OpenApiSpex.Operation
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "UnprocessableEntity",
      description: "Unprocessable entity error response.",
      type: :object,
      additionalProperties: false,
      example: %{
        errors: [
          %{
            title: "Invalid value",
            detail: "null value where string expected"
          }
        ]
      },
      properties: %{
        errors: %Schema{
          type: :array,
          example: [
            %{
              title: "Invalid value",
              detail: "null value where string expected"
            }
          ],
          items: %Schema{
            type: :object,
            properties: %{
              title: %Schema{type: :string, example: "Invalid value"},
              detail: %Schema{type: :string, example: "null value where string expected"}
            },
            required: [:title, :detail]
          }
        }
      },
      required: [:errors]
    },
    struct?: false
  )

  def response do
    Operation.response(
      "Unprocessable Entity.",
      "application/json",
      __MODULE__
    )
  end
end
