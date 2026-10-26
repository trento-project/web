# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.OpenApi.V1.Schema.ChecksExecutionSettings do
  @moduledoc false

  defmodule Settings do
    @moduledoc false

    require OpenApiSpex
    alias OpenApiSpex.Schema

    @intervals ~w(5m 15m 30m 1h 6h 12h 24h 1w 2w 4w disabled)

    OpenApiSpex.schema(
      %{
        title: "ChecksExecutionSettingsV1",
        description:
          "Global interval of the periodic checks executions. When enforced from the environment (CHECKS_INTERVAL) it cannot be changed.",
        type: :object,
        additionalProperties: false,
        properties: %{
          interval: %Schema{
            type: :string,
            enum: @intervals,
            description: "Checks execution interval, or disabled"
          },
          enforced_from_env: %Schema{
            type: :boolean,
            description: "Whether the interval is set by the CHECKS_INTERVAL environment variable"
          }
        },
        required: [:interval, :enforced_from_env],
        example: %{interval: "15m", enforced_from_env: false}
      },
      struct?: false
    )
  end

  defmodule UpdateRequest do
    @moduledoc false

    require OpenApiSpex
    alias OpenApiSpex.Schema

    @intervals ~w(5m 15m 30m 1h 6h 12h 24h 1w 2w 4w disabled)

    OpenApiSpex.schema(
      %{
        title: "UpdateChecksExecutionSettingsRequestV1",
        description: "New global checks execution interval",
        type: :object,
        additionalProperties: false,
        properties: %{
          interval: %Schema{
            type: :string,
            enum: @intervals,
            description: "Checks execution interval, or disabled"
          }
        },
        required: [:interval],
        example: %{interval: "1h"}
      },
      struct?: false
    )
  end
end
