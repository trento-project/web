# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.ScheduleActivity do
  @moduledoc """
  Activity log entries of operation schedules. Every entry of a schedule
  carries the schedule id as correlation id.
  """

  alias Trento.ActivityLog.{ActivityLog, SeverityLevel}
  alias Trento.Operations.OperationSchedule

  @spec changeset(String.t(), OperationSchedule.t(), String.t(), map()) :: Ecto.Changeset.t()
  def changeset(type, %OperationSchedule{} = schedule, actor, extra \\ %{}) do
    metadata =
      schedule
      |> metadata()
      |> Map.merge(extra)
      |> Jason.encode!()
      |> Jason.decode!()

    ActivityLog.changeset(%ActivityLog{}, %{
      type: type,
      actor: actor,
      metadata: metadata,
      severity:
        type
        |> SeverityLevel.map_severity_level(metadata)
        |> SeverityLevel.severity_level_to_integer()
    })
  end

  defp metadata(%OperationSchedule{id: id} = schedule) do
    %{
      schedule_id: id,
      correlation_id: id,
      target_type: schedule.target_type,
      target_id: schedule.target_id,
      operation: schedule.operation,
      params: schedule.params,
      starts_at: schedule.starts_at,
      timezone: schedule.timezone,
      recurrence: OperationSchedule.recurrence(schedule),
      next_run_at: schedule.next_run_at,
      bulk_id: schedule.bulk_id
    }
  end
end
