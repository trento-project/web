defmodule TrentoWeb.OpenApi.V1.Schema.BadRequest do
  @moduledoc """
  Bad Request.
  """

  require OpenApiSpex

  alias OpenApiSpex.Operation
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "BadRequest",
      description: "Bad request error response.",
      type: :object,
      additionalProperties: false,
      example: %{
        errors: [
          %{
            detail: "Invalid request payload.",
            title: "Bad Request"
          }
        ]
      },
      properties: %{
        errors: %Schema{
          type: :array,
          example: [
            %{
              detail: "Invalid request payload.",
              title: "Bad Request"
            }
          ],
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
      "Bad Request.",
      "application/json",
      __MODULE__
    )
  end
end
