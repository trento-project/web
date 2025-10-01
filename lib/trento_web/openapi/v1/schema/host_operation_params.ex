defmodule TrentoWeb.OpenApi.V1.Schema.HostOperationParams do
  @moduledoc false
  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule SaptuneSolutionApplyParams do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "SaptuneSolutionApplyParams_V1",
        description:
          "Represents the parameters for applying a Saptune solution to a host, supporting automated configuration and compliance.",
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
      title: "HostOperationParams_V1",
      description:
        "Represents the parameters for a host operation request, including actions such as applying Saptune solutions for system management.",
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
