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
        "Indicates that the requested bulk operation has been authorized for all the resources and processed, providing an individual operation for each resource that was started and listing the resources whose operation could not be requested.",
      type: :object,
      additionalProperties: false,
      example: %{
        bulk_operation_id: "8f0e1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b",
        operations: [
          %{
            resource_id: "c1a2b3c4-d5e6-7890-abcd-ef1234567890",
            operation_id: "123e4567-e89b-12d3-a456-426614174000"
          }
        ],
        failed_requests: [
          %{
            resource_id: "d2b3c4d5-e6f7-8901-bcde-f12345678901",
            reason: ":amqp_error"
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
        },
        failed_requests: %Schema{
          type: :array,
          items: %Schema{
            type: :object,
            additionalProperties: false,
            properties: %{
              resource_id: %Schema{type: :string, format: :uuid},
              reason: %Schema{type: :string}
            },
            required: [:resource_id, :reason]
          }
        }
      },
      required: [:bulk_operation_id, :operations, :failed_requests]
    },
    struct?: false
  )

  def response do
    Operation.response(
      "A detailed response indicating that the requested bulk operation has been processed, including the individual operation of each started resource and the resources that failed to be requested.",
      "application/json",
      __MODULE__
    )
  end
end
