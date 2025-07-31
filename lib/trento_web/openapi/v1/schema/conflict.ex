defmodule TrentoWeb.OpenApi.V1.Schema.Conflict do
  @moduledoc """
  409 - Conflict.
  """
  require OpenApiSpex

  alias OpenApiSpex.Operation
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "Conflict",
      description: "Resource conflict error response.",
      type: :object,
      additionalProperties: false,
      example: %{
        errors: [
          %{
            detail: "Conflicting state.",
            title: "Conflict has occurred"
          }
        ]
      },
      properties: %{
        errors: %Schema{
          type: :array,
          example: [
            %{
              detail: "Conflicting state.",
              title: "Conflict has occurred"
            }
          ],
          items: %Schema{
            type: :object,
            properties: %{
              detail: %Schema{type: :string, example: "Conflicting state."},
              title: %Schema{type: :string, example: "Conflict has occurred"}
            }
          }
        }
      }
    },
    struct?: false
  )

  def response do
    Operation.response(
      "Conflict.",
      "application/json",
      __MODULE__
    )
  end
end
