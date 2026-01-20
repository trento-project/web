defmodule TrentoWeb.OpenApi.V1.Schema.Operations.SaptuneSolutionApplyParams do
  @moduledoc false
  require OpenApiSpex
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "SaptuneSolutionApplyParamsV1",
      description:
        "Represents the parameters for applying or changing a Saptune solution to a host.",
      type: :object,
      additionalProperties: false,
      properties: %{
        solution: %Schema{type: :string, example: "HANA"}
      },
      required: [:solution],
      example: %{
        solution: "HANA"
      }
    },
    struct?: false
  )
end
