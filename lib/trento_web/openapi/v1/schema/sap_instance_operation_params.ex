defmodule TrentoWeb.OpenApi.V1.Schema.SapInstanceOperationParams do
  @moduledoc false
  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule StartStopParams do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "StartStopParams",
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
      title: "SapInstanceOperationParams",
      description:
        "Request parameters for SAP instance operations, supporting flexible control over instance lifecycle actions.",
      type: :object,
      oneOf: [
        StartStopParams
      ],
      example: %{
        timeout: 300
      }
    },
    struct?: false
  )
end
