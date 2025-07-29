defmodule TrentoWeb.OpenApi.V1.Schema.DatabaseOperationParams do
  @moduledoc false
  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule StartStopParams do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "StartStopParams",
        description: "Database start/stop operation params",
        type: :object,
        additionalProperties: false,
        properties: %{
          site: %Schema{
            type: :string,
            description:
              "System replication site to start/stop if system replication is configured",
            nullable: true
          },
          timeout: %Schema{
            type: :number,
            description: "Timeout in seconds to wait until database is started/stopped"
          }
        }
      },
      struct?: false
    )
  end

  OpenApiSpex.schema(
    %{
      title: "DatabaseOperationParams",
      description: "Database operation request parameters",
      oneOf: [
        StartStopParams
      ]
    },
    struct?: false
  )
end
