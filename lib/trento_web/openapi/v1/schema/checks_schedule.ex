# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.OpenApi.V1.Schema.Checks.ChecksSchedule do
  @moduledoc false
  require OpenApiSpex
  alias OpenApiSpex.Schema
  alias TrentoWeb.OpenApi.V1.Schema.Platform.ChecksFrequency

  OpenApiSpex.schema(
    %{
      title: "ChecksScheduleV1",
      description:
        "The checks schedule of a host or cluster: the settings in use, whether they are the global ones, and its next execution.",
      type: :object,
      additionalProperties: false,
      properties: %{
        enabled: %Schema{
          type: :boolean,
          description: "Whether the checks of the target run periodically.",
          example: true
        },
        frequency: %Schema{
          description:
            "How often the checks of the target run periodically. Null when the target follows the global settings and the environment disables them.",
          type: :object,
          nullable: true,
          oneOf: [ChecksFrequency]
        },
        global: %Schema{
          type: :boolean,
          description:
            "True when the target follows the global settings, false when it has its own schedule.",
          example: false
        },
        next_execution_at: %Schema{
          type: :string,
          format: :"date-time",
          nullable: true,
          description:
            "When the checks of the target run next. Null when the target is not checked periodically."
        }
      },
      required: [:enabled, :frequency, :global, :next_execution_at],
      example: %{
        enabled: true,
        frequency: %{value: 6, unit: "hour"},
        global: false,
        next_execution_at: "2026-11-26T15:00:00.000000Z"
      }
    },
    struct?: false
  )
end

defmodule TrentoWeb.OpenApi.V1.Schema.Checks.ChecksScheduleRequest do
  @moduledoc false
  require OpenApiSpex
  alias OpenApiSpex.Schema
  alias TrentoWeb.OpenApi.V1.Schema.Platform.ChecksFrequency

  OpenApiSpex.schema(
    %{
      title: "ChecksScheduleRequestV1",
      description: "The own checks schedule of a host or cluster.",
      type: :object,
      additionalProperties: false,
      properties: %{
        enabled: %Schema{
          type: :boolean,
          description: "Whether the checks of the target run periodically.",
          example: true
        },
        frequency: ChecksFrequency
      },
      required: [:enabled, :frequency],
      example: %{enabled: true, frequency: %{value: 6, unit: "hour"}}
    },
    struct?: false
  )
end
