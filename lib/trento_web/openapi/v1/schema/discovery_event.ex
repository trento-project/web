defmodule TrentoWeb.OpenApi.V1.Schema.DiscoveryEvent do
  @moduledoc false

  alias OpenApiSpex.Schema

  require OpenApiSpex

  OpenApiSpex.schema(
    %{
      title: "DiscoveryEvent",
      description: "A discovery event.",
      type: :object,
      additionalProperties: false,
      properties: %{
        agent_id: %Schema{type: :string, format: :uuid, example: "123e4567-e89b-12d3-a456-426614174000"},
        discovery_type: %Schema{type: :string, example: "host_discovery"},
        payload: %Schema{
          oneOf: [%Schema{type: :object}, %Schema{type: :array, items: %Schema{type: :object}}]
        }
      },
      required: [:agent_id, :discovery_type, :payload],
      example: %{
        agent_id: "123e4567-e89b-12d3-a456-426614174000",
        discovery_type: "host_discovery",
        payload: %{
          hostname: "suse-node1",
          ip_addresses: ["10.1.1.2"],
          agent_version: "1.0.0"
        }
      }
    },
    struct?: false
  )
end
