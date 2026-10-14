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

  defmodule ExceptionWindow do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "ChecksExceptionWindowV1",
        description: "Time window in which checks are not executed for the target.",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{type: :string, format: :uuid},
          starts_at: %Schema{type: :string, format: :"date-time"},
          duration: %Schema{type: :integer, description: "Duration in minutes."}
        },
        required: [:id, :starts_at, :duration]
      },
      struct?: false
    )
  end

  defmodule CreateExceptionWindowRequest do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "CreateChecksExceptionWindowRequestV1",
        description: "Request to add an exception window to the target.",
        type: :object,
        additionalProperties: false,
        properties: %{
          starts_at: %Schema{type: :string, format: :"date-time"},
          duration: %Schema{type: :integer, minimum: 1, description: "Duration in minutes."}
        },
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
          last_scheduled_at: %Schema{type: :string, format: :"date-time", nullable: true},
          exception_windows: %Schema{type: :array, items: ExceptionWindow}
        },
        required: [:interval, :effective_interval, :last_scheduled_at, :exception_windows]
      },
      struct?: false
    )
  end

  defmodule UpdateChecksScheduleRequest do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "UpdateChecksScheduleRequestV1",
        description: "Request to set or reset the checks execution interval of the target.",
        type: :object,
        additionalProperties: false,
        properties: %{
          interval: %Schema{
            type: :integer,
            nullable: true,
            enum: [nil | Interval.values()],
            description: "Interval in minutes. Null resets it to the global one."
          }
        },
        required: [:interval]
      },
      struct?: false
    )
  end
end
