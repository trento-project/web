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
      description:
        "Represents an error response for a bad request, providing details about the nature of the client-side issue.",
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
                description:
                  "Provides a detailed explanation of the error encountered in the request, supporting troubleshooting and resolution.",
                example: "Invalid request payload."
              },
              title: %Schema{
                type: :string,
                description:
                  "A short summary of the error type, used for quick identification and error handling.",
                example: "Bad Request"
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
      "A detailed error response indicating a bad request, including information about the client-side issue encountered.",
      "application/json",
      __MODULE__
    )
  end
end
