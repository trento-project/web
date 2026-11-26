# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.OpenApi.V1.Schema.DatabaseHealthDetails do
  @moduledoc false

  require OpenApiSpex

  alias TrentoWeb.OpenApi.V1.Schema.HealthValueDetails

  OpenApiSpex.schema(
    %{
      title: "DatabaseHealthDetailsV1",
      description: "Health statuses of the individual health components of the HANA database",
      type: :object,
      nullable: false,
      properties: %{
        instances_health: HealthValueDetails
      },
      required: [:instances_health],
      example: %{
        instances_health: %{value: "passing"}
      }
    },
    struct?: false
  )
end
