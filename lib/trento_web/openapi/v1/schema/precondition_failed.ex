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
      description:
        "Error response returned when a precondition for the requested operation is not met, such as a mid-air collision or outdated resource.",
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
          description:
            "A list of error objects describing why the precondition for the requested operation was not met, such as resource conflicts or outdated data.",
          example: [
            %{
              detail:
                "Mid-air collision detected, please refresh the resource you are trying to update.",
              title: "Precondition Failed"
            }
          ],
          items: %Schema{
            type: :object,
            description:
              "Details about a specific error encountered when a precondition fails, including a human-readable message and error title.",
            properties: %{
              detail: %Schema{
                type: :string,
                description:
                  "A message describing the reason for the precondition failure, such as a mid-air collision or outdated resource.",
                example:
                  "Mid-air collision detected, please refresh the resource you are trying to update."
              },
              title: %Schema{
                type: :string,
                description:
                  "A short title summarizing the error encountered when the precondition is not met.",
                example: "Precondition Failed"
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
      "A detailed error response indicating that a precondition for the requested operation was not met, including information about resource conflicts or outdated data.",
      "application/json",
      __MODULE__
    )
  end
end
