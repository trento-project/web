defmodule TrentoWeb.OpenApi.Schema.Tag do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(%{
    title: "Tag",
    description: "A tag attached to a resource",
    type: :object,
    properties: %{
      id: %Schema{type: :integer},
      resource_id: %Schema{type: :string, format: :uuid},
      resource_type: %Schema{type: :string, enum: [:host, :cluster, :sap_system, :database]},
      value: %Schema{type: :string}
    }
  })
end
