defmodule TrentoWeb.OpenApi.V1.Schema.Tags do
  @moduledoc false

  require OpenApiSpex

  defmodule Tag do
    @moduledoc false

    require OpenApiSpex
    alias OpenApiSpex.Schema

    OpenApiSpex.schema(
      %{
        title: "Tag",
        description:
          "Represents a tag attached to a resource, including its identifier, type, value, and timestamps for resource classification and management.",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{type: :integer},
          resource_id: %Schema{type: :string, format: :uuid},
          resource_type: %Schema{type: :string, enum: [:host, :cluster, :sap_system, :database]},
          value: %Schema{type: :string},
          inserted_at: %Schema{type: :string, format: :datetime},
          updated_at: %Schema{type: :string, format: :datetime, nullable: true}
        },
        example: %{
          id: 1,
          resource_id: "123e4567-e89b-12d3-a456-426614174000",
          resource_type: "host",
          value: "production",
          inserted_at: "2024-01-15T09:00:00Z",
          updated_at: "2024-01-15T10:30:00Z"
        }
      },
      struct?: false
    )
  end

  OpenApiSpex.schema(
    %{
      title: "Tags",
      description:
        "A list of tags attached to a resource, supporting resource classification, filtering, and management across the infrastructure.",
      type: :array,
      items: Tag,
      example: [
        %{
          id: 1,
          resource_id: "123e4567-e89b-12d3-a456-426614174000",
          resource_type: "host",
          value: "production",
          inserted_at: "2024-01-15T09:00:00Z",
          updated_at: "2024-01-15T10:30:00Z"
        }
      ]
    },
    struct?: false
  )
end
