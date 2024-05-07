defmodule TrentoWeb.OpenApi.V1.Schema.PreconditionFailed do
  @moduledoc """
  412 - Precondition Failed
  """
  require OpenApiSpex

  alias OpenApiSpex.Operation
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(%{
    title: "PreconditionFailed",
    type: :object,
    additionalProperties: false,
    properties: %{
      errors: %Schema{
        type: :array,
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
  })

  def response do
    Operation.response(
      "Precondition Failed",
      "application/json",
      __MODULE__
    )
  end
end
