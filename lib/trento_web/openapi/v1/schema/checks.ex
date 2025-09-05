defmodule TrentoWeb.OpenApi.V1.Schema.Checks.ChecksSelectionRequest do
  @moduledoc false
  require OpenApiSpex
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "ChecksSelectionRequest",
      description:
        "Represents a request containing a list of checks to be executed on the target infrastructure, supporting automated validation and compliance.",
      additionalProperties: false,
      type: :object,
      example: %{
        checks: ["check_1", "check_2", "check_3"]
      },
      properties: %{
        checks: %Schema{
          type: :array,
          description:
            "A list of check identifiers specifying which checks should be executed as part of the request.",
          items: %Schema{type: :string}
        }
      },
      required: [:checks]
    },
    struct?: false
  )
end
