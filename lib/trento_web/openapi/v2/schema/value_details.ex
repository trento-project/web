# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.OpenApi.V2.Schema.HealthValueDetails do
  @moduledoc false

  require OpenApiSpex

  alias TrentoWeb.OpenApi.V1.Schema.ResourceHealth

  OpenApiSpex.schema(
    %{
      title: "HealthValueDetals",
      description: "Value details object describing a Health value",
      type: :object,
      nullable: false,
      properties: %{
        value: ResourceHealth
      },
      required: [:value]
    },
    struct?: false
  )
end
