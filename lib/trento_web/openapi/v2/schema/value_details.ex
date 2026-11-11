# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.OpenApi.V2.Schema.HealthValueDetails do
  @moduledoc false

  require OpenApiSpex
  require Trento.Enums.Health, as: Health

  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "HealthValueDetails",
      description: "Value details object describing the health of one health factor",
      type: :object,
      nullable: false,
      properties: %{
        value: %Schema{
          type: :string,
          enum: Health.values() ++ [:not_applicable],
          description:
            "Health of the factor, or `not_applicable` for a factor that does not apply to the resource."
        }
      },
      required: [:value],
      example: %{
        value: "passing"
      }
    },
    struct?: false
  )
end
