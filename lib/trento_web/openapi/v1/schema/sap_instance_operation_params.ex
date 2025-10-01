defmodule TrentoWeb.OpenApi.V1.Schema.SapInstanceOperationParams do
  @moduledoc false
  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule SapInstanceStartStopParams do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "SapInstanceStartStopParams_V1",
        description:
          "Parameters for starting or stopping a SAP instance, including options for controlling operation timing.",
        type: :object,
        additionalProperties: false,
        properties: %{
          timeout: %Schema{
            type: :number,
            description:
              "Specifies the time in seconds to wait for the SAP instance to complete the start or stop operation.",
            example: 300
          }
        },
        example: %{
          timeout: 300
        }
      },
      struct?: false
    )
  end

  OpenApiSpex.schema(
    %{
      title: "SapInstanceOperationParams_V1",
      description:
        "Request parameters for SAP instance operations, supporting flexible control over instance lifecycle actions.",
      oneOf: [
        SapInstanceStartStopParams
      ],
      example: %{
        timeout: 300
      }
    },
    struct?: false
  )
end
