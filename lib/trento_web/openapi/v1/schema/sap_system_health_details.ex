# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.OpenApi.V1.Schema.SapSystemHealthDetails do
  @moduledoc false

  require OpenApiSpex

  alias TrentoWeb.OpenApi.V1.Schema.HealthValueDetails

  OpenApiSpex.schema(
    %{
      title: "SapSystemHealthDetailsV1",
      description: "Health statuses of the individual health components of the SAP system",
      type: :object,
      nullable: false,
      properties: %{
        instances_health: HealthValueDetails,
        database_health: HealthValueDetails
      },
      required: [:instances_health, :database_health],
      example: %{
        instances_health: %{value: "passing"},
        database_health: %{value: "passing"}
      }
    },
    struct?: false
  )
end
