defmodule TrentoWeb.OpenApi.V1.Schema.SlesSubscription do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "SlesSubscription",
      description:
        "Represents a discovered SLES subscription on a host, including identification, version, architecture, status, and validity period for license management and compliance.",
      type: :object,
      additionalProperties: false,
      properties: %{
        host_id: %Schema{type: :string, format: :uuid},
        identifier: %Schema{type: :string},
        version: %Schema{type: :string},
        arch: %Schema{type: :string},
        status: %Schema{type: :string},
        subscription_status: %Schema{type: :string},
        type: %Schema{type: :string},
        starts_at: %Schema{type: :string},
        expires_at: %Schema{type: :string}
      },
      example: %{
        host_id: "9876b7a8-2e1f-4b9a-8e7d-3a4b5c6d7e8f",
        identifier: "SLES_SAP-15-SP3",
        version: "15.3",
        arch: "x86_64",
        status: "Registered",
        subscription_status: "ACTIVE",
        type: "FULL",
        starts_at: "2024-01-01T00:00:00Z",
        expires_at: "2025-12-31T23:59:59Z"
      }
    },
    struct?: false
  )
end
