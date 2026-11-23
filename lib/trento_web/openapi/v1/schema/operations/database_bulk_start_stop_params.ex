# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.OpenApi.V1.Schema.Operations.DatabaseBulkStartStopParams do
  @moduledoc false
  require OpenApiSpex
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "DatabaseBulkStartStopParamsV1",
      description:
        "Represents the parameters for starting or stopping multiple databases at once. The operation is applied to all the system replication sites of every database.",
      type: :object,
      additionalProperties: false,
      example: %{
        database_ids: [
          "d1a2b3c4-d5e6-7890-abcd-ef1234567890",
          "e2b3c4d5-e6f7-8901-bcde-f12345678901"
        ],
        params: %{
          timeout: 300
        }
      },
      properties: %{
        database_ids: %Schema{
          type: :array,
          description: "Unique identifiers of the databases on which the operation is requested.",
          minItems: 1,
          uniqueItems: true,
          items: %Schema{type: :string, format: :uuid}
        },
        params: %Schema{
          type: :object,
          additionalProperties: false,
          properties: %{
            timeout: %Schema{
              type: :integer,
              description:
                "The maximum time in seconds to wait for each database to complete the start or stop operation.",
              example: 300
            }
          }
        }
      },
      required: [:database_ids]
    },
    struct?: false
  )
end
