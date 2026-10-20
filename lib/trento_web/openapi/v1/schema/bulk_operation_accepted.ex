# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.OpenApi.V1.Schema.BulkOperationAccepted do
  @moduledoc false
  require OpenApiSpex

  alias OpenApiSpex.Operation
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "BulkOperationAcceptedV1",
      description:
        "Indicates that the requested bulk operation has been authorized for all the resources and accepted for processing, providing an individual operation for each resource.",
      type: :object,
      additionalProperties: false,
      example: %{
        bulk_operation_id: "8f0e1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b",
        operations: [
          %{
            resource_id: "c1a2b3c4-d5e6-7890-abcd-ef1234567890",
            operation_id: "123e4567-e89b-12d3-a456-426614174000"
          }
        ]
      },
      properties: %{
        bulk_operation_id: %Schema{type: :string, format: :uuid},
        operations: %Schema{
          type: :array,
          items: %Schema{
            type: :object,
            additionalProperties: false,
            properties: %{
              resource_id: %Schema{type: :string, format: :uuid},
              operation_id: %Schema{type: :string, format: :uuid}
            },
            required: [:resource_id, :operation_id]
          }
        }
      },
      required: [:bulk_operation_id, :operations]
    },
    struct?: false
  )

  def response do
    Operation.response(
      "A detailed response indicating that the requested bulk operation has been accepted for processing, including the individual operation of each resource.",
      "application/json",
      __MODULE__
    )
  end
end
