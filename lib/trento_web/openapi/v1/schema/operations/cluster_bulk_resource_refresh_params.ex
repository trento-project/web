# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.OpenApi.V1.Schema.Operations.ClusterBulkResourceRefreshParams do
  @moduledoc false
  require OpenApiSpex
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "ClusterBulkResourceRefreshParamsV1",
      description:
        "Represents the parameters for refreshing all the resources of multiple clusters at once.",
      type: :object,
      additionalProperties: false,
      example: %{
        cluster_ids: [
          "c1a2b3c4-d5e6-7890-abcd-ef1234567890",
          "d2b3c4d5-e6f7-8901-bcde-f12345678901"
        ]
      },
      properties: %{
        cluster_ids: %Schema{
          type: :array,
          description: "Unique identifiers of the clusters on which the operation is requested.",
          minItems: 1,
          items: %Schema{type: :string, format: :uuid}
        }
      },
      required: [:cluster_ids]
    },
    struct?: false
  )
end
