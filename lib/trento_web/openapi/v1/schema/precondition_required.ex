defmodule TrentoWeb.OpenApi.V1.Schema.PreconditionRequired do
  @moduledoc """
  428 - Precondition Required
  """
  require OpenApiSpex

  alias OpenApiSpex.Operation
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(%{
    title: "PreconditionRequired",
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
              example: "Request needs to be conditional, please provide If-Match header."
            },
            title: %Schema{type: :string, example: "Precondition Required"}
          }
        }
      }
    }
  })

  def response do
    Operation.response(
      "Precondition Required",
      "application/json",
      __MODULE__
    )
  end
end
