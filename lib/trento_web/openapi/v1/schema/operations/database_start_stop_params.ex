defmodule TrentoWeb.OpenApi.V1.Schema.Operations.DatabaseStartStopParams do
  @moduledoc false
  require OpenApiSpex
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "DatabaseStartStopParamsV1",
      description: "Parameters required to start or stop a database.",
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
