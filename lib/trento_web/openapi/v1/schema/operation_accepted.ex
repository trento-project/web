defmodule TrentoWeb.OpenApi.V1.Schema.OperationAccepted do
  @moduledoc false
  require OpenApiSpex

  alias OpenApiSpex.Operation
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "OperationAccepted",
      description: "The operation has been authorized and requested.",
      type: :object,
      additionalProperties: false,
      example: %{
        operation_id: "123e4567-e89b-12d3-a456-426614174000"
      },
      properties: %{
        operation_id: %Schema{type: :string, format: :uuid}
      },
      required: [:operation_id]
    },
    struct?: false
  )

  def response do
    Operation.response(
      "Operation Accepted.",
      "application/json",
      __MODULE__
    )
  end
end
