defmodule TrentoWeb.OpenApi.V1.Schema.Checks.ChecksSelectionRequest do
  @moduledoc false
  require OpenApiSpex
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "ChecksSelectionRequest",
      description:
        "A list of desired checks that should be executed on the target infrastructure",
      additionalProperties: false,
      type: :object,
      properties: %{
        checks: %Schema{
          type: :array,
          items: %Schema{type: :string}
        }
      },
      required: [:checks]
    },
    struct?: false
  )
end
