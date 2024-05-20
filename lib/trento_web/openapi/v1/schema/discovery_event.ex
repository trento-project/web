defmodule TrentoWeb.OpenApi.V1.Schema.DiscoveryEvent do
  @moduledoc false

  alias OpenApiSpex.Schema

  require OpenApiSpex

  OpenApiSpex.schema(%{
    title: "DiscoveryEvent",
    description: "A discovery event",
    type: :object,
    additionalProperties: false,
    properties: %{
      agent_id: %Schema{type: :string, format: :uuid},
      discovery_type: %Schema{type: :string},
      payload: %Schema{
        nullable: true,
        oneOf: [%Schema{type: :object}, %Schema{type: :array}]
      }
    },
    required: [:agent_id, :discovery_type, :payload]
  })
end
