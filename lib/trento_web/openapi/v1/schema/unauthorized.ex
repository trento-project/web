defmodule TrentoWeb.OpenApi.V1.Schema.Unauthorized do
  @moduledoc """
  401 - Unauthorized.
  """
  require OpenApiSpex

  alias OpenApiSpex.Operation
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "Unauthorized",
      description:
        "Error response returned when access to the requested operation is denied due to missing or invalid authentication credentials.",
      type: :object,
      additionalProperties: false,
      example: %{
        errors: [
          %{
            detail: "The requested operation could not be authorized.",
            title: "Unauthorized"
          }
        ]
      },
      properties: %{
        errors: %Schema{
          type: :array,
          description:
            "A list of error objects describing why access to the requested operation was denied, such as missing or invalid authentication credentials.",
          example: [
            %{
              detail: "The requested operation could not be authorized.",
              title: "Unauthorized"
            }
          ],
          items: %Schema{
            type: :object,
            description:
              "Details about a specific error encountered when access is denied, including a human-readable message and error title.",
            properties: %{
              detail: %Schema{
                type: :string,
                description:
                  "A message describing the reason for the unauthorized access, such as missing or invalid authentication credentials.",
                example: "The requested operation could not be authorized."
              },
              title: %Schema{
                type: :string,
                description:
                  "A short title summarizing the error encountered when access is denied due to authorization failure.",
                example: "Unauthorized"
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
      "A detailed error response indicating that access to the requested operation is denied due to missing or invalid authentication credentials.",
      "application/json",
      __MODULE__
    )
  end
end
