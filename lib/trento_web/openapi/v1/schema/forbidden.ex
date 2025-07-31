defmodule TrentoWeb.OpenApi.V1.Schema.Forbidden do
  @moduledoc """
  403 - Forbidden.
  """
  require OpenApiSpex

  alias OpenApiSpex.Operation
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "Forbidden",
      description: "Access forbidden error response.",
      type: :object,
      additionalProperties: false,
      example: %{
        errors: [
          %{
            detail: "The requested operation could not be performed.",
            title: "Forbidden"
          }
        ]
      },
      properties: %{
        errors: %Schema{
          type: :array,
          example: [
            %{
              detail: "The requested operation could not be performed.",
              title: "Forbidden"
            }
          ],
          items: %Schema{
            type: :object,
            properties: %{
              detail: %Schema{
                type: :string,
                example: "The requested operation could not be performed."
              },
              title: %Schema{type: :string, example: "Forbidden"}
            }
          }
        }
      }
    },
    struct?: false
  )

  def response do
    Operation.response(
      "Forbidden.",
      "application/json",
      __MODULE__
    )
  end
end
