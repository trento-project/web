defmodule TrentoWeb.OpenApi.V1.Schema.Operations.SapInstanceStartStopParams do
  @moduledoc false
  require OpenApiSpex
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "SapInstanceStartStopParamsV1",
      description: "Parameters for starting or stopping a SAP instance.",
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
