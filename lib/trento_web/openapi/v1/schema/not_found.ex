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
      description:
        "Represents an error response for a resource not found, providing details about the reason the requested resource could not be located.",
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
              detail: %Schema{
                type: :string,
                description:
                  "Provides a detailed explanation of why the requested resource could not be found, supporting troubleshooting and resolution.",
                example: "The requested resource cannot be found."
              },
              title: %Schema{
                type: :string,
                description:
                  "A short summary indicating the not found status, used for quick identification and error handling.",
                example: "Not Found"
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
      "A detailed error response indicating that the requested resource could not be found, including information about the reason for the missing resource.",
      "application/json",
      __MODULE__
    )
  end
end
