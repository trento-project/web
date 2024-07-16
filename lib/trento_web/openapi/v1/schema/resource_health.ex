defmodule TrentoWeb.OpenApi.V1.Schema.ResourceHealth do
  @moduledoc false

  require OpenApiSpex
  require Trento.Enums.Health, as: Health

  OpenApiSpex.schema(
    %{
      title: "ResourceHealth",
      type: :string,
      nullable: true,
      description: "Detected health of a Resource",
      enum: Health.values()
    },
    struct?: false
  )
end
