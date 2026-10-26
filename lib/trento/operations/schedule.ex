# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Schedule do
  @moduledoc """
  The operation schedule aggregate.

  It holds when the operation runs next and how many times it ran. Policies
  and requests are side effects: they happen outside the aggregate, which
  only records their outcome.
  """

  alias Trento.Operations.Commands.{
    CancelOperationSchedule,
    ChangeOperationSchedule,
    CompleteScheduledRun,
    ScheduleOperation,
    StartScheduledRun
  }

  alias Trento.Operations.Events.{
    OperationScheduleCancelled,
    OperationScheduleChanged,
    OperationScheduled,
    ScheduledOperationRequested,
    ScheduledOperationRequestFailed,
    ScheduledRunStarted
  }

  alias Trento.Scheduling.Recurrence

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
    field :cancelled, :boolean, default: false
    field :ended, :boolean, default: false
    field :run_in_progress, :utc_datetime_usec
  end

  @frequency_atoms %{
    "daily" => :daily,
    "weekly" => :weekly,
    "monthly" => :monthly,
    "yearly" => :yearly
  }

  def execute(%__MODULE__{schedule_id: nil}, %ScheduleOperation{} = command),
    do: struct(OperationScheduled, Map.from_struct(command))

  def execute(%__MODULE__{}, %ScheduleOperation{}),
    do: {:error, :operation_schedule_already_exists}

  def execute(%__MODULE__{schedule_id: nil}, _), do: {:error, :operation_schedule_not_found}
  def execute(%__MODULE__{cancelled: true}, _), do: {:error, :operation_schedule_not_found}
  def execute(%__MODULE__{ended: true}, _), do: {:error, :operation_schedule_not_found}

  def execute(%__MODULE__{run_in_progress: run_at}, %StartScheduledRun{run_at: run_at})
      when not is_nil(run_at),
      do: {:error, :run_in_progress}

  def execute(%__MODULE__{next_run_at: next_run_at} = schedule, %StartScheduledRun{} = command) do
    if DateTime.compare(next_run_at, command.run_at) == :eq do
      %ScheduledRunStarted{
        schedule_id: schedule.schedule_id,
        run_at: command.run_at,
        started_at: command.started_at
      }
    else
      {:error, :stale_run}
    end
  end

  def execute(%__MODULE__{run_in_progress: nil}, %CompleteScheduledRun{}),
    do: {:error, :stale_run}

  def execute(%__MODULE__{run_in_progress: run_at} = schedule, %CompleteScheduledRun{} = command) do
    if DateTime.compare(run_at, command.run_at) == :eq do
      complete(schedule, command)
    else
      {:error, :stale_run}
    end
  end

  def execute(%__MODULE__{} = schedule, %ChangeOperationSchedule{} = command) do
    schedule
    |> event_fields(command.actor)
    |> Map.merge(%{
      params: command.params,
      starts_at: command.starts_at,
      timezone: command.timezone,
      recurrence: command.recurrence,
      next_run_at: command.next_run_at
    })
    |> then(&struct(OperationScheduleChanged, &1))
  end

  def execute(%__MODULE__{} = schedule, %CancelOperationSchedule{actor: actor}),
    do: struct(OperationScheduleCancelled, event_fields(schedule, actor))

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

  def apply(%__MODULE__{} = schedule, %OperationScheduleChanged{} = event) do
    %__MODULE__{
      schedule
      | params: event.params,
        starts_at: event.starts_at,
        timezone: event.timezone,
        recurrence: event.recurrence,
        next_run_at: event.next_run_at,
        occurrences: 0
    }
  end

  def apply(%__MODULE__{} = schedule, %OperationScheduleCancelled{}),
    do: %__MODULE__{schedule | cancelled: true}

  def apply(%__MODULE__{} = schedule, %ScheduledRunStarted{run_at: run_at}),
    do: %__MODULE__{schedule | run_in_progress: run_at}

  def apply(%__MODULE__{} = schedule, %event{next_run_at: next_run_at, occurrences: occurrences})
      when event in [ScheduledOperationRequested, ScheduledOperationRequestFailed] do
    %__MODULE__{
      schedule
      | next_run_at: next_run_at,
        occurrences: occurrences,
        run_in_progress: nil,
        ended: is_nil(next_run_at)
    }
  end

  defp complete(%__MODULE__{} = schedule, %CompleteScheduledRun{} = command) do
    occurrences = schedule.occurrences + 1
    after_instant = Enum.max([command.run_at, command.completed_at], DateTime)

    fields =
      schedule
      |> event_fields("system")
      |> Map.merge(%{
        run_at: command.run_at,
        occurrences: occurrences,
        next_run_at: next_occurrence(schedule, occurrences, after_instant)
      })

    case command.outcome do
      :requested ->
        struct(ScheduledOperationRequested, Map.put(fields, :operation_id, command.operation_id))

      :failed ->
        struct(
          ScheduledOperationRequestFailed,
          Map.merge(fields, %{reason: command.reason, errors: command.errors})
        )
    end
  end

  defp next_occurrence(%__MODULE__{recurrence: nil}, _, _), do: nil

  defp next_occurrence(%__MODULE__{recurrence: recurrence} = schedule, occurrences, after_instant) do
    recurrence = Map.new(recurrence, fn {key, value} -> {to_string(key), value} end)

    Recurrence.next_occurrence(
      %{
        starts_at: schedule.starts_at,
        timezone: schedule.timezone,
        frequency: Map.get(@frequency_atoms, recurrence["frequency"]),
        interval: recurrence["interval"] || 1,
        weekdays: recurrence["weekdays"] || [],
        ends_on: recurrence["ends_on"] && Date.from_iso8601!(to_string(recurrence["ends_on"])),
        max_occurrences: recurrence["max_occurrences"],
        occurrences: occurrences
      },
      after_instant
    )
  end

  # The schedule as the events describe it, so that every activity entry tells
  # which target and operation it is about.
  defp event_fields(%__MODULE__{} = schedule, actor) do
    %{
      schedule_id: schedule.schedule_id,
      target_type: schedule.target_type,
      target_id: schedule.target_id,
      operation: schedule.operation,
      params: schedule.params,
      starts_at: schedule.starts_at,
      timezone: schedule.timezone,
      recurrence: schedule.recurrence,
      next_run_at: schedule.next_run_at,
      bulk_id: schedule.bulk_id,
      actor: actor
    }
  end
end
