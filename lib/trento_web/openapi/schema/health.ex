defmodule TrentoWeb.OpenApi.Schema.ResourceHealth do
  @moduledoc false

  require OpenApiSpex
  require Trento.Domain.Enum.Health, as: Health

  OpenApiSpex.schema(%{
    title: "ResourceHealth",
    type: :string,
    description: "Detected health of a Resource",
    enum: Health.values()
  })
end
