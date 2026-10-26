# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Projections.OperationScheduleProjector do
  @moduledoc """
  Projects the operation schedules into the operation_schedules read model.
  Strongly consistent: the API answers with the projected schedule.
  """

  use Commanded.Projections.Ecto,
    application: Trento.Commanded,
    repo: Trento.Repo,
    name: "operation_schedule_projector",
    consistency: :strong

  alias Trento.Operations.Events.{
    OperationScheduleCancelled,
    OperationScheduleChanged,
    OperationScheduled,
    ScheduledOperationRequested,
    ScheduledOperationRequestFailed
  }

  import Ecto.Query, only: [from: 2]

  alias Trento.Operations.OperationSchedule

  project(%OperationScheduled{} = event, fn multi ->
    Ecto.Multi.insert(
      multi,
      :operation_schedule,
      struct(
        OperationSchedule,
        Map.merge(recurrence_fields(event.recurrence), %{
          id: event.schedule_id,
          target_type: event.target_type,
          target_id: event.target_id,
          operation: event.operation,
          params: event.params || %{},
          starts_at: event.starts_at,
          timezone: event.timezone,
          next_run_at: event.next_run_at,
          occurrences: 0,
          bulk_id: event.bulk_id,
          created_by: event.actor
        })
      )
    )
  end)

  project(%OperationScheduleChanged{schedule_id: schedule_id} = event, fn multi ->
    changes =
      Map.merge(recurrence_fields(event.recurrence), %{
        params: event.params || %{},
        starts_at: event.starts_at,
        timezone: event.timezone,
        next_run_at: event.next_run_at,
        occurrences: 0
      })

    update(multi, schedule_id, changes)
  end)

  project(%OperationScheduleCancelled{schedule_id: schedule_id}, fn multi ->
    Ecto.Multi.delete_all(
      multi,
      :operation_schedule,
      from(s in OperationSchedule, where: s.id == ^schedule_id)
    )
  end)

  project(%event{schedule_id: schedule_id, next_run_at: nil}, fn multi
                                                                 when event in [
                                                                        ScheduledOperationRequested,
                                                                        ScheduledOperationRequestFailed
                                                                      ] ->
    Ecto.Multi.delete_all(
      multi,
      :operation_schedule,
      from(s in OperationSchedule, where: s.id == ^schedule_id)
    )
  end)

  project(
    %event{schedule_id: schedule_id, next_run_at: next_run_at, occurrences: occurrences},
    fn multi when event in [ScheduledOperationRequested, ScheduledOperationRequestFailed] ->
      update(multi, schedule_id, %{next_run_at: next_run_at, occurrences: occurrences})
    end
  )

  # update_all, so that fields going back to their default value are written too
  defp update(multi, schedule_id, changes) do
    Ecto.Multi.update_all(
      multi,
      :operation_schedule,
      from(s in OperationSchedule, where: s.id == ^schedule_id),
      set: Map.to_list(Map.put(changes, :updated_at, DateTime.utc_now()))
    )
  end

  @doc false
  def recurrence_fields(nil),
    do: %{frequency: nil, interval: 1, weekdays: [], ends_on: nil, max_occurrences: nil}

  def recurrence_fields(recurrence) do
    recurrence = Map.new(recurrence, fn {key, value} -> {to_string(key), value} end)

    %{
      frequency: recurrence["frequency"],
      interval: recurrence["interval"] || 1,
      weekdays: recurrence["weekdays"] || [],
      ends_on: recurrence["ends_on"] && Date.from_iso8601!(to_string(recurrence["ends_on"])),
      max_occurrences: recurrence["max_occurrences"]
    }
  end
end
