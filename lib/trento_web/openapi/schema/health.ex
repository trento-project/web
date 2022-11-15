defmodule TrentoWeb.OpenApi.Schema.ResourceHealth do
  @moduledoc false

  require OpenApiSpex
  require Trento.Domain.Enums.Health, as: Health

  OpenApiSpex.schema(%{
    title: "ResourceHealth",
    type: :string,
    nullable: true,
    description: "Detected health of a Resource",
    enum: Health.values()
  })
end
