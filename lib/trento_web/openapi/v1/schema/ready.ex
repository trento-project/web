defmodule TrentoWeb.OpenApi.V1.Schema.Ready do
  @moduledoc """
  Ready
  """
  alias OpenApiSpex.Operation
  alias OpenApiSpex.Schema

  require OpenApiSpex

  OpenApiSpex.schema(
    %Schema{
      title: "Ready",
      type: :object,
      example: %{
        ready: true
      },
      additionalProperties: false,
      properties: %{
        ready: %Schema{
          description: "Trento Web platform ready",
          type: :boolean
        }
      }
    },
    struct?: false
  )

  def response do
    Operation.response(
      "Ready",
      "application/json",
      __MODULE__
    )
  end
end
