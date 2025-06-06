defmodule TrentoWeb.OpenApi.V1.Schema.SapSystemOperationParams do
  @moduledoc false
  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule SapInstanceStartStopParams do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "SapInstanceStartStopParams",
        description: "SAP instance start/stop operation params",
        type: :object,
        additionalProperties: false,
        properties: %{
          host_id: %Schema{
            type: :string,
            description: "Host ID where the instance is running"
          },
          instance_number: %Schema{
            type: :string,
            description: "Instance number to start/stop"
          },
          timeout: %Schema{
            type: :number,
            description: "Timeout in seconds to wait until instance is started/stopped"
          }
        },
        required: [:host_id, :instance_number]
      },
      struct?: false
    )
  end

  OpenApiSpex.schema(
    %{
      title: "SapSystemOperationParams",
      description: "SAP system operation request parameters",
      oneOf: [
        SapInstanceStartStopParams
      ]
    },
    struct?: false
  )
end
