# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.OpenApi.V1.Schema.ChecksSchedule do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  alias Trento.ChecksScheduling.Interval

  defmodule ChecksExecutionSettings do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "ChecksExecutionSettingsV1",
        description: "Global checks execution settings.",
        type: :object,
        additionalProperties: false,
        properties: %{
          interval: %Schema{
            type: :integer,
            description: "Checks execution interval in minutes."
          },
          enforced_from_env: %Schema{
            type: :boolean,
            description: "The interval is set from the environment and cannot be changed."
          }
        },
        required: [:interval, :enforced_from_env]
      },
      struct?: false
    )
  end

  defmodule UpdateChecksExecutionSettingsRequest do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "UpdateChecksExecutionSettingsRequestV1",
        description: "Request to change the global checks execution interval.",
        type: :object,
        additionalProperties: false,
        properties: %{
          interval: %Schema{
            type: :integer,
            enum: Interval.values(),
            description: "Checks execution interval in minutes."
          }
        },
        required: [:interval]
      },
      struct?: false
    )
  end

  defmodule ExceptionWindowProperties do
    @moduledoc false

    alias OpenApiSpex.Schema

    def properties do
      %{
        starts_at: %Schema{type: :string, format: :"date-time"},
        duration: %Schema{type: :integer, minimum: 1, description: "Duration in minutes."},
        timezone: %Schema{type: :string, example: "Europe/Berlin"},
        frequency: %Schema{
          type: :string,
          nullable: true,
          enum: [nil, "daily", "weekly", "monthly", "yearly"],
          description: "Null for a one-time window."
        },
        interval: %Schema{type: :integer, minimum: 1, description: "Repeat every X periods."},
        weekdays: %Schema{
          type: :array,
          items: %Schema{type: :integer, minimum: 1, maximum: 7},
          description: "Weekly windows: 1 Monday .. 7 Sunday."
        },
        ends_on: %Schema{type: :string, format: :date, nullable: true}
      }
    end
  end

  defmodule ExceptionWindow do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "ChecksExceptionWindowV1",
        description: "One-time or recurring time window in which checks are not executed.",
        type: :object,
        additionalProperties: false,
        nullable: true,
        properties:
          Map.put(ExceptionWindowProperties.properties(), :id, %Schema{
            type: :string,
            format: :uuid
          }),
        required: [:id, :starts_at, :duration, :timezone, :frequency, :interval, :weekdays]
      },
      struct?: false
    )
  end

  defmodule ExceptionWindowRequest do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "ChecksExceptionWindowRequestV1",
        description: "Exception window to set on the target. Null removes it.",
        type: :object,
        additionalProperties: false,
        nullable: true,
        properties: ExceptionWindowProperties.properties(),
        required: [:starts_at, :duration]
      },
      struct?: false
    )
  end

  defmodule ChecksSchedule do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "ChecksScheduleV1",
        description: "Checks execution schedule of a host or a cluster.",
        type: :object,
        additionalProperties: false,
        properties: %{
          interval: %Schema{
            type: :integer,
            nullable: true,
            description: "Interval set for the target in minutes. Null means the global one."
          },
          effective_interval: %Schema{
            type: :integer,
            description: "Interval applied to the target in minutes."
          },
          global_interval: %Schema{
            type: :integer,
            description: "Global interval in minutes, applied when the target has none."
          },
          last_scheduled_at: %Schema{type: :string, format: :"date-time", nullable: true},
          exception_window: ExceptionWindow,
          in_exception_window: %Schema{
            type: :boolean,
            description: "Checks cannot be executed now: the target is in its exception window."
          }
        },
        required: [
          :interval,
          :effective_interval,
          :global_interval,
          :last_scheduled_at,
          :exception_window,
          :in_exception_window
        ]
      },
      struct?: false
    )
  end

  defmodule UpdateChecksScheduleRequest do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "UpdateChecksScheduleRequestV1",
        description: "Sets the checks execution interval and the exception window of the target.",
        type: :object,
        additionalProperties: false,
        properties: %{
          interval: %Schema{
            type: :integer,
            nullable: true,
            enum: [nil | Interval.values()],
            description: "Interval in minutes. Null resets it to the global one."
          },
          exception_window: ExceptionWindowRequest
        },
        required: [:interval, :exception_window]
      },
      struct?: false
    )
  end
end
