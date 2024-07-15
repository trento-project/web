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
        description: "A tag attached to a resource",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{type: :integer},
          resource_id: %Schema{type: :string, format: :uuid},
          resource_type: %Schema{type: :string, enum: [:host, :cluster, :sap_system, :database]},
          value: %Schema{type: :string},
          inserted_at: %Schema{type: :string, format: :datetime},
          updated_at: %Schema{type: :string, format: :datetime, nullable: true}
        }
      },
      struct?: false
    )
  end

  OpenApiSpex.schema(
    %{
      title: "Tags",
      description: "A list of tags attached to a resource",
      type: :array,
      items: Tag
    },
    struct?: false
  )
end
