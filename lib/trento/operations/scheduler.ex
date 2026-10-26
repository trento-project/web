# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Scheduler do
  @moduledoc """
  Runs one occurrence of an operation schedule. The Oban job of the schedule
  calls `run/3` at the scheduled time.

  - later than the grace period: the request failed because Trento was not available
  - otherwise the operation policies run on fresh data, and the operation is
    requested when they pass
  - a request that cannot be sent snoozes the job, which retries it until the
    grace period ends

  Then a one-time schedule is removed, and a periodic one moves to its next
  occurrence after the scheduled time, or after now when it ran late, with a
  new job.

  A job whose occurrence is not the next one of its schedule (the schedule
  changed after it was enqueued) does nothing.
  """

  import Ecto.Query, only: [from: 2]

  alias Trento.Operations.{OperationSchedule, Requests, ScheduleActivity, ScheduleJobs}
  alias Trento.Repo
  alias Trento.Scheduling.Recurrence
  alias Trento.Support.DateService

  require Logger

  @grace_period_seconds 300
  @snooze_seconds 60

  @spec grace_period_seconds() :: pos_integer()
  def grace_period_seconds, do: @grace_period_seconds

  @spec run(String.t(), DateTime.t(), module()) :: :ok | {:snooze, pos_integer()}
  def run(schedule_id, run_at, date_service \\ DateService) do
    now = date_service.utc_now()

    Repo.transaction(fn ->
      case Repo.one(from s in OperationSchedule, where: s.id == ^schedule_id, lock: "FOR UPDATE") do
        %OperationSchedule{next_run_at: next_run_at} = schedule ->
          if DateTime.compare(next_run_at, run_at) == :eq, do: handle(schedule, now)

        nil ->
          :ok
      end
    end)
    |> case do
      {:ok, _} -> :ok
      {:error, :retry} -> {:snooze, @snooze_seconds}
    end
  end

  defp handle(%OperationSchedule{next_run_at: run_at} = schedule, now) do
    case outcome(schedule, now) do
      :retry ->
        Repo.rollback(:retry)

      {type, extra} ->
        Repo.insert!(
          ScheduleActivity.changeset(type, schedule, "system", Map.put(extra, :run_at, run_at))
        )

        advance(schedule, now)
    end
  end

  defp outcome(%OperationSchedule{next_run_at: run_at} = schedule, now) do
    if DateTime.diff(now, run_at) > @grace_period_seconds do
      {"scheduled_operation_request_failed", %{reason: "not_available"}}
    else
      request(schedule)
    end
  end

  defp request(%OperationSchedule{} = schedule) do
    {:ok, target_type, operation} = Requests.parse(schedule.target_type, schedule.operation)

    case Requests.request(target_type, schedule.target_id, operation, schedule.params) do
      {:ok, operation_id} ->
        {"scheduled_operation_requested", %{operation_id: operation_id}}

      {:error, :forbidden, errors} ->
        {"scheduled_operation_request_failed", %{reason: "policies", errors: errors}}

      {:error, :not_found} ->
        {"scheduled_operation_request_failed", %{reason: "target_not_found"}}

      {:error, reason} ->
        Logger.warning(
          "Scheduled operation #{schedule.id} could not be requested, retrying: #{inspect(reason)}"
        )

        :retry
    end
  end

  defp advance(%OperationSchedule{occurrences: occurrences, next_run_at: run_at} = schedule, now) do
    done = %OperationSchedule{schedule | occurrences: occurrences + 1}
    after_instant = Enum.max([run_at, now], DateTime)

    case Recurrence.next_occurrence(OperationSchedule.to_recurrence(done), after_instant) do
      nil ->
        Repo.delete!(schedule)

      next_run_at ->
        schedule
        |> Ecto.Changeset.change(next_run_at: next_run_at, occurrences: occurrences + 1)
        |> Repo.update!()
        |> ScheduleJobs.new()
        |> Oban.insert!()
    end
  end
end
