defmodule TrentoWeb.OpenApi.V1.Schema.HostOperationParams do
  @moduledoc false
  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule SaptuneSolutionApplyParams do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "SaptuneSolutionApplyParams",
        description: "Saptune solution apply operation params.",
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

  OpenApiSpex.schema(
    %{
      title: "HostOperationParams",
      description: "Host operation request parameters.",
      type: :object,
      oneOf: [
        SaptuneSolutionApplyParams
      ],
      example: %{
        solution: "HANA"
      }
    },
    struct?: false
  )
end
