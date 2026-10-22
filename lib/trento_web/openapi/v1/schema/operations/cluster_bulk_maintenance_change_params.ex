# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.OpenApi.V1.Schema.Operations.ClusterBulkMaintenanceChangeParams do
  @moduledoc false
  require OpenApiSpex
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "ClusterBulkMaintenanceChangeParamsV1",
      description:
        "Represents the parameters for changing the maintenance state of multiple whole clusters at once. The same maintenance state is applied to every cluster.",
      type: :object,
      additionalProperties: false,
      example: %{
        cluster_ids: [
          "c1a2b3c4-d5e6-7890-abcd-ef1234567890",
          "d2b3c4d5-e6f7-8901-bcde-f12345678901"
        ],
        params: %{
          maintenance: true
        }
      },
      properties: %{
        cluster_ids: %Schema{
          type: :array,
          description: "Unique identifiers of the clusters on which the operation is requested.",
          minItems: 1,
          items: %Schema{type: :string, format: :uuid}
        },
        params: %Schema{
          type: :object,
          additionalProperties: false,
          properties: %{
            maintenance: %Schema{
              type: :boolean,
              description: "Indicates the desired maintenance state to apply to the clusters."
            }
          },
          required: [:maintenance]
        }
      },
      required: [:cluster_ids, :params]
    },
    struct?: false
  )
end
