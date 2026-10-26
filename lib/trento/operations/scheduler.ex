# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Scheduler do
  @moduledoc """
  Runs the due operation schedules. A Quantum job calls `run_due/1` every minute.

  For each schedule whose next_run_at is past:

  - later than the grace period: the request failed because Trento was not available
  - otherwise the operation policies run on fresh data, and the operation is
    requested when they pass
  - a request that cannot be sent leaves the schedule due, so the next run
    retries it until the grace period ends

  Then a one-time schedule is removed, and a periodic one moves to its next
  occurrence after the scheduled time, or after now when it ran late.

  Each schedule is handled in its own transaction, locked with
  FOR UPDATE SKIP LOCKED, so a slow request does not hold the others.
  """

  import Ecto.Query, only: [from: 2]

  alias Trento.Operations.{OperationSchedule, Requests, ScheduleActivity}
  alias Trento.Repo
  alias Trento.Scheduling.Recurrence
  alias Trento.Support.DateService

  require Logger

  @grace_period_seconds 300

  @spec grace_period_seconds() :: pos_integer()
  def grace_period_seconds, do: @grace_period_seconds

  @spec run_due(module()) :: :ok
  def run_due(date_service \\ DateService) do
    now = date_service.utc_now()

    Repo.all(
      from s in OperationSchedule,
        where: s.next_run_at <= ^now,
        order_by: [asc: s.next_run_at],
        select: s.id
    )
    |> Enum.each(&run(&1, now))
  end

  defp run(schedule_id, now) do
    Repo.transaction(fn ->
      case Repo.one(
             from s in OperationSchedule,
               where: s.id == ^schedule_id and s.next_run_at <= ^now,
               lock: "FOR UPDATE SKIP LOCKED"
           ) do
        nil -> :skipped
        schedule -> handle(schedule, now)
      end
    end)
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
    end
  end
end
