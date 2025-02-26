defmodule TrentoWeb.OpenApi.V1.Schema.OperationAccepted do
  @moduledoc false
  require OpenApiSpex

  alias OpenApiSpex.Operation
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "OperationAccepted",
      description: "The operation has been authorized and requested",
      type: :object,
      additionalProperties: false,
      properties: %{
        operation_id: %Schema{type: :string, format: :uuid}
      },
      required: [:operation_id]
    },
    struct?: false
  )

  def response do
    Operation.response(
      "Operation Accepted",
      "application/json",
      __MODULE__
    )
  end
end
