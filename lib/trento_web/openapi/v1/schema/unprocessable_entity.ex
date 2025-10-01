defmodule TrentoWeb.OpenApi.V1.Schema.UnprocessableEntity do
  @moduledoc """
  422 - Unprocessable Entity.
  """
  require OpenApiSpex

  alias OpenApiSpex.Operation
  alias OpenApiSpex.Schema

  # See https://github.com/open-api-spex/open_api_spex/blob/master/lib/open_api_spex/json_error_response.ex
  OpenApiSpex.schema(
    %{
      title: "UnprocessableEntity_V1",
      description:
        "Error response returned when the server cannot process the request due to semantic errors, such as invalid or missing values in the payload.",
      type: :object,
      additionalProperties: false,
      example: %{
        errors: [
          %{
            title: "Invalid value",
            detail: "null value where string expected"
          }
        ]
      },
      properties: %{
        errors: %Schema{
          type: :array,
          description:
            "A list of error objects describing why the request could not be processed, such as semantic errors or invalid values in the payload.",
          example: [
            %{
              title: "Invalid value",
              detail: "null value where string expected"
            }
          ],
          items: %Schema{
            type: :object,
            description:
              "Details about a specific error encountered when the request is unprocessable, including a human-readable message and error title.",
            properties: %{
              title: %Schema{
                type: :string,
                description:
                  "A short title summarizing the error encountered when the request cannot be processed due to semantic issues.",
                example: "Invalid value"
              },
              source: %Schema{
                type: :object,
                description:
                  "An object containing references to the source of the error, optionally including a JSON Pointer to the associated entity in the request document.",
                properties: %{
                  pointer: %Schema{
                    type: :string,
                    description:
                      "A pointer to the associated entity in the request document (e.g., '/data/attributes/firstName' for a specific attribute).",
                    example: "/data/attributes/firstName"
                  }
                },
                required: [:pointer],
                example: %{
                  pointer: "/data/attributes/email"
                }
              },
              detail: %Schema{
                type: :string,
                description:
                  "A message describing the reason for the unprocessable entity error, such as invalid or missing values in the payload.",
                example: "null value where string expected"
              }
            },
            required: [:title, :detail]
          }
        }
      },
      required: [:errors]
    },
    struct?: false
  )

  def response do
    Operation.response(
      "A detailed error response indicating that the server cannot process the request due to semantic errors, such as invalid or missing values in the payload.",
      "application/json",
      __MODULE__
    )
  end
end
