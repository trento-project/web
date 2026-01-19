defmodule TrentoWeb.OpenApi.V1.Schema.Operations.SapSystemStartStopParams do
  @moduledoc false
  require OpenApiSpex
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "SapSystemStartStopParamsV1",
      description: "Parameters required to start or stop an SAP system instance.",
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
