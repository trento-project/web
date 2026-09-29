# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.OpenApi.V2.Schema.ClusterHealthDetails do
  @moduledoc false

  require OpenApiSpex

  alias TrentoWeb.OpenApi.V2.Schema.HealthValueDetails

  OpenApiSpex.schema(
    %{
      title: "ClusterHealthDetails",
      description: "Health statuses of the individual health components of the cluster",
      type: :object,
      nullable: true,
      oneOf: [
        %OpenApiSpex.Schema{
          title: "Health details for clusters of type `hana_scale_up` and `hana_scale_out`",
          properties: %{
            checks_health: HealthValueDetails,
            sbd_health: HealthValueDetails,
            replication_health: HealthValueDetails
          },
          required: [:checks_health, :sbd_health, :replication_health]
        },
        %OpenApiSpex.Schema{
          title: "Health details for clusters of type `ascs_ers`",
          properties: %{
            checks_health: HealthValueDetails,
            sbd_health: HealthValueDetails,
            distributed_health: HealthValueDetails
          },
          required: [:checks_health, :sbd_health, :distributed_health]
        },
      ],
    },
    struct?: false
  )
end
