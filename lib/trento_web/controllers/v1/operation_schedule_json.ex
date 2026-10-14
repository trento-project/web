# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.V1.OperationScheduleJSON do
  @fields ~w(id target_type target_id operation params starts_at timezone frequency interval
             weekdays ends_on max_occurrences occurrences next_run_at)a

  def operation_schedules(%{schedules: schedules}), do: Enum.map(schedules, &schedule/1)

  def operation_schedule(%{schedule: schedule}), do: schedule(schedule)

  defp schedule(schedule), do: Map.take(schedule, @fields)
end
