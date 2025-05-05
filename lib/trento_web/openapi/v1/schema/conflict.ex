defmodule TrentoWeb.OpenApi.V1.Schema.Conflict do
  @moduledoc """
  409 - Conflict
  """
  require OpenApiSpex

  alias OpenApiSpex.Operation
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "Conflict",
      type: :object,
      additionalProperties: false,
      properties: %{
        errors: %Schema{
          type: :array,
          items: %Schema{
            type: :object,
            properties: %{
              detail: %Schema{type: :string, example: "Conflicting state."},
              title: %Schema{type: :string, example: "Conflict has occured"}
            }
          }
        }
      }
    },
    struct?: false
  )

  def response do
    Operation.response(
      "Conflict",
      "application/json",
      __MODULE__
    )
  end
end
