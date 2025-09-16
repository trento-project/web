defmodule TrentoWeb.OpenApi.V1.Schema.DatabaseOperationParams do
  @moduledoc false
  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule DatabaseStartStopParams do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "DatabaseStartStopParams",
        description:
          "Parameters required to start or stop a database, including system replication site configuration and operation timeout for reliable management.",
        type: :object,
        additionalProperties: false,
        example: %{
          site: "primary",
          timeout: 300
        },
        properties: %{
          site: %Schema{
            type: :string,
            description:
              "Specifies the system replication site to start or stop when system replication is configured, supporting targeted operations on specific replication sites.",
            nullable: true,
            example: "primary"
          },
          timeout: %Schema{
            type: :number,
            description:
              "The maximum time in seconds to wait for the database to complete the start or stop operation, supporting reliability and error handling.",
            example: 300
          }
        }
      },
      struct?: false
    )
  end

  OpenApiSpex.schema(
    %{
      title: "DatabaseOperationParams",
      description:
        "Request parameters for database operations, supporting flexible control over database lifecycle actions such as starting or stopping databases with configurable options.",
      oneOf: [
        TrentoWeb.OpenApi.V1.Schema.DatabaseOperationParams.DatabaseStartStopParams
      ],
      example: %{
        site: "primary",
        timeout: 300
      }
    },
    struct?: false
  )
end
