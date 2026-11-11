# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.OpenApi.V2.Schema.ClusterHealthDetails do
  @moduledoc false

  require OpenApiSpex

  alias OpenApiSpex.Schema
  alias TrentoWeb.OpenApi.V2.Schema.HealthValueDetails

  @checks_health %Schema{
    description:
      "Overall result of the selected checks. With no checks selected, the value is `not_applicable`.",
    allOf: [HealthValueDetails]
  }

  @sbd_health %Schema{
    description:
      "Overall health of the SBD devices. Without SBD devices, the value is `not_applicable`.",
    allOf: [HealthValueDetails]
  }

  OpenApiSpex.schema(
    %{
      title: "ClusterHealthDetails",
      description:
        "Health statuses of the individual health components of the cluster. `null` for cluster types without health details.",
      type: :object,
      nullable: true,
      oneOf: [
        %Schema{
          description: "Health details for clusters of type `hana_scale_up` and `hana_scale_out`",
          type: :object,
          properties: %{
            checks_health: @checks_health,
            sbd_health: @sbd_health,
            replication_health: %Schema{
              description: "System replication status of the HANA cluster.",
              allOf: [HealthValueDetails]
            }
          },
          required: [:checks_health, :sbd_health, :replication_health]
        },
        %Schema{
          description: "Health details for clusters of type `ascs_ers`",
          type: :object,
          properties: %{
            checks_health: @checks_health,
            sbd_health: @sbd_health,
            distributed_health: %Schema{
              description:
                "Distribution of the ASCS and ERS instances. Both instances on the same host give `critical`.",
              allOf: [HealthValueDetails]
            }
          },
          required: [:checks_health, :sbd_health, :distributed_health]
        }
      ],
      example: %{
        checks_health: %{value: "passing"},
        sbd_health: %{value: "passing"},
        replication_health: %{value: "passing"}
      }
    },
    struct?: false
  )
end
