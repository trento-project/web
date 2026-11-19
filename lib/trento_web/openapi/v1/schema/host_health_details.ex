# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.OpenApi.V1.Schema.HostHealthDetails do
  @moduledoc false

  require OpenApiSpex

  alias TrentoWeb.OpenApi.V2.Schema.HealthValueDetails

  OpenApiSpex.schema(
    %{
      title: "HostHealthDetailsV1",
      description: "Health statuses of the individual health components of the host",
      type: :object,
      nullable: false,
      properties: %{
        checks_health: HealthValueDetails,
        saptune_health: HealthValueDetails,
        software_updates_discovery_health: HealthValueDetails
      },
      required: [:checks_health, :saptune_health, :software_updates_discovery_health],
      example: %{
        checks_health: %{value: "passing"},
        saptune_health: %{value: "passing"},
        software_updates_discovery_health: %{value: "passing"}
      }
    },
    struct?: false
  )
end
