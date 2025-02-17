defmodule TrentoWeb.OpenApi.V1.Schema.OperationParams do
  @moduledoc false
  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule SaptuneSolutionApplyParams do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "SaptuneSolutionApplyParams",
        description: "Saptune solution apply operation params",
        type: :object,
        additionalProperties: false,
        properties: %{
          solution: %Schema{type: :string}
        },
        required: [:solution]
      },
      struct?: false
    )
  end

  OpenApiSpex.schema(
    %{
      title: "OperationParams",
      description: "Operation request parameters",
      oneOf: [
        SaptuneSolutionApplyParams
      ]
    },
    struct?: false
  )
end
