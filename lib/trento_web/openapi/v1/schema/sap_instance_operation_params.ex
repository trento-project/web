defmodule TrentoWeb.OpenApi.V1.Schema.SapInstanceOperationParams do
  @moduledoc false
  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule StartStopParams do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "StartStopParams",
        description: "SAP instance start/stop operation params",
        type: :object,
        additionalProperties: false,
        properties: %{
          timeout: %Schema{
            type: :number,
            description: "Timeout in seconds to wait until instance is started/stopped"
          }
        }
      },
      struct?: false
    )
  end

  OpenApiSpex.schema(
    %{
      title: "SapInstanceOperationParams",
      description: "SAP instance operation request parameters",
      oneOf: [
        StartStopParams
      ]
    },
    struct?: false
  )
end
