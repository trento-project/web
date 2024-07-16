defmodule TrentoWeb.OpenApi.V1.Schema.NotFound do
  @moduledoc """
  404 - Not Found
  """
  require OpenApiSpex

  alias OpenApiSpex.Operation
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "NotFound",
      type: :object,
      additionalProperties: false,
      properties: %{
        errors: %Schema{
          type: :array,
          items: %Schema{
            type: :object,
            properties: %{
              detail: %Schema{type: :string, example: "The requested resource cannot be found."},
              title: %Schema{type: :string, example: "Not Found"}
            }
          }
        }
      }
    },
    struct?: false
  )

  def response do
    Operation.response(
      "Not Found",
      "application/json",
      __MODULE__
    )
  end
end
