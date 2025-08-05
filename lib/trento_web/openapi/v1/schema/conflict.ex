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
      description:
        "Represents an error response for a resource conflict, providing details about the nature of the conflict encountered.",
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
              detail: %Schema{
                type: :string,
                description:
                  "Provides a detailed explanation of the conflict encountered, supporting troubleshooting and resolution.",
                example: "Conflicting state."
              },
              title: %Schema{
                type: :string,
                description:
                  "A short summary of the conflict type, used for quick identification and error handling.",
                example: "Conflict has occurred"
              }
            }
          }
        }
      }
    },
    struct?: false
  )

  def response do
    Operation.response(
      "A detailed error response indicating a resource conflict, including information about the nature of the conflict encountered.",
      "application/json",
      __MODULE__
    )
  end
end
