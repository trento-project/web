defmodule TrentoWeb.OpenApi.Schema.Ready do
  @moduledoc """
  Ready
  """
  alias OpenApiSpex.Operation
  alias OpenApiSpex.Schema

  require OpenApiSpex

  OpenApiSpex.schema(%Schema{
    title: "Ready",
    type: :object,
    example: %{
      ready: true
    },
    properties: %{
      ready: %Schema{
        description: "Trento Web platform ready",
        type: :boolean
      }
    }
  })

  def response do
    Operation.response(
      "Ready",
      "application/json",
      __MODULE__
    )
  end
end
