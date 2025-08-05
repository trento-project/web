defmodule TrentoWeb.OpenApi.V1.Schema.SapSystemOperationParams do
  @moduledoc false
  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule StartStopParams do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "StartStopParams",
        description:
          "Parameters required to start or stop an SAP system instance, including instance type and operation timeout for reliable management.",
        type: :object,
        additionalProperties: false,
        properties: %{
          instance_type: %Schema{
            type: :string,
            description:
              "Specifies the type of SAP system instance to be started or stopped, supporting targeted operations.",
            example: "ASCS"
          },
          timeout: %Schema{
            type: :number,
            description:
              "The maximum time in seconds to wait for the SAP system to complete the start or stop operation, supporting reliability and error handling.",
            example: 300
          }
        },
        example: %{
          instance_type: "ASCS",
          timeout: 300
        }
      },
      struct?: false
    )
  end

  OpenApiSpex.schema(
    %{
      title: "SapSystemOperationParams",
      description:
        "Request parameters for SAP system operations, supporting actions such as starting or stopping system instances with configurable options.",
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
