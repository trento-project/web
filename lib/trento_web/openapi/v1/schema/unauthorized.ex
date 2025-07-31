defmodule TrentoWeb.OpenApi.V1.Schema.Unauthorized do
  @moduledoc """
  401 - Unauthorized.
  """
  require OpenApiSpex

  alias OpenApiSpex.Operation
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "Unauthorized",
      description: "Unauthorized access error response.",
      type: :object,
      additionalProperties: false,
      example: %{
        errors: [
          %{
            detail: "The requested operation could not be authorized.",
            title: "Unauthorized"
          }
        ]
      },
      properties: %{
        errors: %Schema{
          type: :array,
          example: [
            %{
              detail: "The requested operation could not be authorized.",
              title: "Unauthorized"
            }
          ],
          items: %Schema{
            type: :object,
            properties: %{
              detail: %Schema{
                type: :string,
                example: "The requested operation could not be authorized."
              },
              title: %Schema{type: :string, example: "Unauthorized"}
            }
          }
        }
      }
    },
    struct?: false
  )

  def response do
    Operation.response(
      "Unauthorized.",
      "application/json",
      __MODULE__
    )
  end
end
