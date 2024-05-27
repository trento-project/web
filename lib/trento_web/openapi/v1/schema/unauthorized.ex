defmodule TrentoWeb.OpenApi.V1.Schema.Unauthorized do
  @moduledoc """
  401 - Unauthorized
  """
  require OpenApiSpex

  alias OpenApiSpex.Operation
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(%{
    title: "Unauthorized",
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
              example: "The requested operation could not be authorized."
            },
            title: %Schema{type: :string, example: "Unauthorized"}
          }
        }
      }
    }
  })

  def response do
    Operation.response(
      "Unauthorized",
      "application/json",
      __MODULE__
    )
  end
end
