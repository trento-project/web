# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Schedule do
  @moduledoc """
  The operation schedule aggregate.

  It holds when the operation runs next and how many times it ran. Policies
  and requests are side effects: they happen outside the aggregate, which
  only records their outcome.
  """

  require Logger

  alias Trento.Operations.Commands.ScheduleOperation
  alias Trento.Operations.Events.OperationScheduled

  @required_fields []

  use Trento.Support.Type

  deftype do
    field :schedule_id, Ecto.UUID
    field :target_type, :string
    field :target_id, Ecto.UUID
    field :operation, :string
    field :params, :map, default: %{}
    field :starts_at, :utc_datetime_usec
    field :timezone, :string
    field :recurrence, :map
    field :next_run_at, :utc_datetime_usec
    field :occurrences, :integer, default: 0
    field :bulk_id, Ecto.UUID
    field :created_by, :string
  end

  def execute(%__MODULE__{schedule_id: nil}, %ScheduleOperation{} = command),
    do: struct(OperationScheduled, Map.from_struct(command))

  def execute(%__MODULE__{}, %ScheduleOperation{}),
    do: {:error, :operation_schedule_already_exists}

  def apply(%__MODULE__{} = schedule, %OperationScheduled{} = event) do
    %__MODULE__{
      schedule
      | schedule_id: event.schedule_id,
        target_type: event.target_type,
        target_id: event.target_id,
        operation: event.operation,
        params: event.params,
        starts_at: event.starts_at,
        timezone: event.timezone,
        recurrence: event.recurrence,
        next_run_at: event.next_run_at,
        occurrences: 0,
        bulk_id: event.bulk_id,
        created_by: event.actor
    }
  end
end
