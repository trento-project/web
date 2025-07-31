defmodule TrentoWeb.OpenApi.V1.Schema.PreconditionRequired do
  @moduledoc """
  428 - Precondition Required.
  """
  require OpenApiSpex

  alias OpenApiSpex.Operation
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "PreconditionRequired",
      description: "Precondition required error response.",
      type: :object,
      additionalProperties: false,
      example: %{
        errors: [
          %{
            detail: "Request needs to be conditional, please provide If-Match header.",
            title: "Precondition Required"
          }
        ]
      },
      properties: %{
        errors: %Schema{
          type: :array,
          example: [
            %{
              detail: "Request needs to be conditional, please provide If-Match header.",
              title: "Precondition Required"
            }
          ],
          items: %Schema{
            type: :object,
            properties: %{
              detail: %Schema{
                type: :string,
                example: "Request needs to be conditional, please provide If-Match header."
              },
              title: %Schema{type: :string, example: "Precondition Required"}
            }
          }
        }
      }
    },
    struct?: false
  )

  def response do
    Operation.response(
      "Precondition Required.",
      "application/json",
      __MODULE__
    )
  end
end
