defmodule TrentoWeb.OpenApi.V1.Schema.PreconditionFailed do
  @moduledoc """
  412 - Precondition Failed.
  """
  require OpenApiSpex

  alias OpenApiSpex.Operation
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "PreconditionFailed",
      description: "Precondition failed error response.",
      type: :object,
      additionalProperties: false,
      example: %{
        errors: [
          %{
            detail:
              "Mid-air collision detected, please refresh the resource you are trying to update.",
            title: "Precondition Failed"
          }
        ]
      },
      properties: %{
        errors: %Schema{
          type: :array,
          example: [
            %{
              detail:
                "Mid-air collision detected, please refresh the resource you are trying to update.",
              title: "Precondition Failed"
            }
          ],
          items: %Schema{
            type: :object,
            properties: %{
              detail: %Schema{
                type: :string,
                example:
                  "Mid-air collision detected, please refresh the resource you are trying to update."
              },
              title: %Schema{type: :string, example: "Precondition Failed"}
            }
          }
        }
      }
    },
    struct?: false
  )

  def response do
    Operation.response(
      "Precondition Failed.",
      "application/json",
      __MODULE__
    )
  end
end
