defmodule TrentoWeb.OpenApi.V1.Schema.NotFound do
  @moduledoc """
  404 - Not Found.
  """
  require OpenApiSpex

  alias OpenApiSpex.Operation
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "NotFound",
      description: "Resource not found error response.",
      type: :object,
      additionalProperties: false,
      example: %{
        errors: [
          %{
            detail: "The requested resource cannot be found.",
            title: "Not Found"
          }
        ]
      },
      properties: %{
        errors: %Schema{
          type: :array,
          example: [
            %{
              detail: "The requested resource cannot be found.",
              title: "Not Found"
            }
          ],
          items: %Schema{
            type: :object,
            properties: %{
              detail: %Schema{type: :string, example: "The requested resource cannot be found."},
              title: %Schema{type: :string, example: "Not Found"}
            }
          }
        }
      }
    },
    struct?: false
  )

  def response do
    Operation.response(
      "Not Found.",
      "application/json",
      __MODULE__
    )
  end
end
