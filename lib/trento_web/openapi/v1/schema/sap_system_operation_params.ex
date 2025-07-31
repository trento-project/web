defmodule TrentoWeb.OpenApi.V1.Schema.SapSystemOperationParams do
  @moduledoc false
  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule StartStopParams do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "StartStopParams",
        description: "SAP system start/stop operation params.",
        type: :object,
        additionalProperties: false,
        properties: %{
          instance_type: %Schema{
            type: :string,
            description: "Instance type to start/stop.",
            example: "ASCS"
          },
          timeout: %Schema{
            type: :number,
            description: "Timeout in seconds to wait until system is started/stopped.",
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
      description: "SAP system operation request parameters.",
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
