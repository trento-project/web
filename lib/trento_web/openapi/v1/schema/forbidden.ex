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
      description:
        "Represents an error response for forbidden access, providing details about the reason the operation could not be performed due to insufficient permissions.",
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
                description:
                  "Provides a detailed explanation of why the requested operation was forbidden, supporting troubleshooting and resolution.",
                example: "The requested operation could not be performed."
              },
              title: %Schema{
                type: :string,
                description:
                  "A short summary indicating the forbidden status, used for quick identification and error handling.",
                example: "Forbidden"
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
      "A detailed error response indicating forbidden access, including information about insufficient permissions and why the operation could not be performed.",
      "application/json",
      __MODULE__
    )
  end
end
