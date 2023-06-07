defmodule TrentoWeb.OpenApi.V1.Schema.UnprocessableEntity do
  @moduledoc """
  422 - Unprocessable Entity
  """
  require OpenApiSpex

  alias OpenApiSpex.Operation
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(%{
    type: :object,
    properties: %{
      errors: %Schema{
        type: :array,
        items: %Schema{
          type: :object,
          properties: %{
            title: %Schema{type: :string, example: "Invalid value"},
            detail: %Schema{type: :string, example: "null value where string expected"}
          },
          required: [:title, :detail]
        }
      }
    },
    required: [:errors]
  })

  def response do
    Operation.response(
      "Unprocessable Entity",
      "application/json",
      __MODULE__
    )
  end
end
