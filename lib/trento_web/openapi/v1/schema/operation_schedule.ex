# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.OpenApi.V1.Schema.OperationSchedule do
  @moduledoc false

  require OpenApiSpex
  require Trento.Operations.Enums.HostOperations, as: HostOperations

  alias OpenApiSpex.Schema

  defmodule RecurrenceProperties do
    @moduledoc false

    alias OpenApiSpex.Schema

    def properties do
      %{
        params: %Schema{type: :object, description: "Operation arguments."},
        starts_at: %Schema{type: :string, format: :"date-time"},
        timezone: %Schema{type: :string, example: "Europe/Berlin"},
        frequency: %Schema{
          type: :string,
          nullable: true,
          enum: [nil, "daily", "weekly", "monthly", "yearly"],
          description: "Null for a one-time schedule."
        },
        interval: %Schema{type: :integer, minimum: 1, description: "Repeat every X periods."},
        weekdays: %Schema{
          type: :array,
          items: %Schema{type: :integer, minimum: 1, maximum: 7},
          description: "Weekly schedules: 1 Monday .. 7 Sunday."
        },
        ends_on: %Schema{
          type: :string,
          format: :date,
          nullable: true,
          description: "No occurrence on this date or after it."
        },
        max_occurrences: %Schema{type: :integer, minimum: 1, nullable: true}
      }
    end
  end

  defmodule OperationSchedule do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "OperationScheduleV1",
        description: "One-time or periodic schedule of an operation on a target.",
        type: :object,
        additionalProperties: false,
        properties:
          Map.merge(RecurrenceProperties.properties(), %{
            id: %Schema{type: :string, format: :uuid},
            target_type: %Schema{type: :string, enum: ["host"]},
            target_id: %Schema{type: :string, format: :uuid},
            operation: %Schema{type: :string},
            occurrences: %Schema{type: :integer},
            next_run_at: %Schema{
              type: :string,
              format: :"date-time",
              nullable: true,
              description: "Null once the schedule has ended."
            }
          }),
        required: [:id, :target_type, :target_id, :operation, :starts_at, :timezone]
      },
      struct?: false
    )
  end

  defmodule OperationSchedules do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "OperationSchedulesV1",
        type: :array,
        items: OperationSchedule
      },
      struct?: false
    )
  end

  defmodule CreateOperationScheduleRequest do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "CreateOperationScheduleRequestV1",
        type: :object,
        additionalProperties: false,
        properties:
          Map.put(
            RecurrenceProperties.properties(),
            :operation,
            %Schema{type: :string, enum: Enum.map(HostOperations.values(), &Atom.to_string/1)}
          ),
        required: [:operation, :starts_at, :timezone]
      },
      struct?: false
    )
  end

  defmodule UpdateOperationScheduleRequest do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "UpdateOperationScheduleRequestV1",
        type: :object,
        additionalProperties: false,
        properties: RecurrenceProperties.properties(),
        required: [:starts_at, :timezone]
      },
      struct?: false
    )
  end
end
