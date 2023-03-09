defmodule TrentoWeb.OpenApi.Schema.Checks.ChecksSelectionRequest do
  @moduledoc false
  require OpenApiSpex
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(%{
    title: "ChecksSelectionRequest",
    description: "A list of desired checks that should be executed on the target infrastructure",
    type: :object,
    properties: %{
      checks: %Schema{
        type: :array,
        items: %Schema{type: :string}
      }
    },
    required: [:checks]
  })
end
