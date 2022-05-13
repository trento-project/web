defmodule TrentoWeb.OpenApi.Schema.ResourceHealth do
  @moduledoc false

  require OpenApiSpex

  OpenApiSpex.schema(%{
    title: "ResourceHealth",
    type: :string,
    description: "Detected health of a Resource",
    enum: [:passing, :warning, :critical, :unknown]
  })
end
