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
      description:
        "Error response returned when a required precondition for the request is missing, such as the absence of an If-Match header for conditional operations.",
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
          description:
            "A list of error objects describing why a required precondition for the request was missing, such as missing headers for conditional operations.",
          example: [
            %{
              detail: "Request needs to be conditional, please provide If-Match header.",
              title: "Precondition Required"
            }
          ],
          items: %Schema{
            type: :object,
            description:
              "Details about a specific error encountered when a required precondition is missing, including a human-readable message and error title.",
            properties: %{
              detail: %Schema{
                type: :string,
                description:
                  "A message describing the reason for the missing precondition, such as the absence of a required header for conditional requests.",
                example: "Request needs to be conditional, please provide If-Match header."
              },
              title: %Schema{
                type: :string,
                description:
                  "A short title summarizing the error encountered when the required precondition is missing.",
                example: "Precondition Required"
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
      "A detailed error response indicating that a required precondition for the request is missing, including information about missing headers for conditional operations.",
      "application/json",
      __MODULE__
    )
  end
end
