# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.V1.OperationScheduleJSON do
  alias Trento.Operations.OperationSchedule

  def operation_schedules(%{schedules: schedules}), do: Enum.map(schedules, &schedule/1)

  def operation_schedule(%{schedule: schedule, warnings: warnings}),
    do: Map.put(schedule(schedule), :warnings, warnings)

  def bulk_operation_schedules(%{bulk_id: bulk_id, results: results}) do
    %{
      bulk_id: bulk_id,
      schedules:
        Enum.map(results, fn {schedule, warnings} ->
          operation_schedule(%{schedule: schedule, warnings: warnings})
        end)
    }
  end

  def schedule(%OperationSchedule{} = schedule) do
    schedule
    |> Map.take([
      :id,
      :target_type,
      :target_id,
      :operation,
      :params,
      :starts_at,
      :timezone,
      :next_run_at,
      :occurrences,
      :bulk_id,
      :created_by,
      :inserted_at,
      :updated_at
    ])
    |> Map.put(:recurrence, OperationSchedule.recurrence(schedule))
  end
end
