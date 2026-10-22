# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Schedules do
  @moduledoc """
  One-time and periodic operation schedules.

  Each schedule has at most one pending Oban job, scheduled at `next_run_at`.
  When the job runs (`run_occurrence/3`) the operation is requested with the same
  preconditions as a manual request (`Trento.Operations.Requests`), the outcome is
  written to the activity log, and the job of the next occurrence is inserted.

  Activity log entries are correlated by `schedule_id`. The request entry also
  holds the `operation_id`, so the existing `operation_completed` entry, including
  wanda's REQUEST_FAILED/ALREADY_RUNNING reply, is correlated to it.
  """

  import Ecto.Query

  require Logger

  alias Ecto.Multi
  alias Trento.ActivityLog.{ActivityLog, SeverityLevel}
  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.Infrastructure.Jobs.ScheduledOperationJob
  alias Trento.Operations.{OperationSchedule, Requests}
  alias Trento.Repo
  alias Trento.Scheduling.Recurrence
  alias Trento.Support.DateService
  alias Trento.Users
  alias Trento.Users.User

  # An occurrence that runs later than this is not requested:
  # Trento was not available at the scheduled time.
  @late_tolerance_seconds 300

  @spec list_schedules(String.t()) :: [OperationSchedule.t()]
  def list_schedules(target_id) do
    Repo.all(
      from s in OperationSchedule,
        where: s.target_id == ^target_id,
        order_by: [asc_nulls_last: s.next_run_at]
    )
  end

  @spec get_schedule(String.t()) :: OperationSchedule.t() | nil
  def get_schedule(schedule_id), do: Repo.get(OperationSchedule, schedule_id)

  @spec create_schedule(map(), User.t(), module()) ::
          {:ok, OperationSchedule.t()} | {:error, Ecto.Changeset.t()}
  def create_schedule(attrs, %User{id: user_id} = user, date_service \\ DateService) do
    now = date_service.utc_now()

    changeset =
      attrs
      |> Map.put(:created_by_id, user_id)
      |> OperationSchedule.create_changeset(now)
      |> put_next_run_at(now)

    Multi.new()
    |> Multi.insert(:schedule, changeset)
    |> Oban.insert(:job, fn %{schedule: schedule} -> occurrence_job(schedule) end)
    |> Multi.run(:log, fn _, %{schedule: schedule} ->
      log(user.username, "operation_scheduled", :info, schedule_metadata(schedule))
    end)
    |> transaction()
  end

  @spec update_schedule(String.t(), map(), User.t(), module()) ::
          {:ok, OperationSchedule.t()} | {:error, :not_found} | {:error, Ecto.Changeset.t()}
  def update_schedule(schedule_id, attrs, %User{} = user, date_service \\ DateService) do
    now = date_service.utc_now()

    with %OperationSchedule{} = schedule <- get_schedule(schedule_id) || {:error, :not_found} do
      changeset =
        schedule
        |> OperationSchedule.update_changeset(attrs, now)
        |> put_next_run_at(now)

      Multi.new()
      |> Multi.run(:cancel, fn _, _ -> cancel_pending_jobs(schedule_id) end)
      |> Multi.update(:schedule, changeset)
      |> Oban.insert(:job, fn %{schedule: schedule} -> occurrence_job(schedule) end)
      |> Multi.run(:log, fn _, %{schedule: schedule} ->
        log(user.username, "operation_schedule_changed", :info, schedule_metadata(schedule))
      end)
      |> transaction()
    end
  end

  @spec delete_schedule(String.t(), User.t()) :: :ok | {:error, :not_found}
  def delete_schedule(schedule_id, %User{} = user) do
    with %OperationSchedule{} = schedule <- get_schedule(schedule_id) || {:error, :not_found} do
      Multi.new()
      |> Multi.run(:cancel, fn _, _ -> cancel_pending_jobs(schedule_id) end)
      |> Multi.delete(:schedule, schedule)
      |> Multi.run(:log, fn _, _ ->
        log(user.username, "operation_schedule_cancelled", :info, schedule_metadata(schedule))
      end)
      |> Repo.transaction()

      :ok
    end
  end

  @doc """
  Runs the occurrence of a schedule at `occurrence_at`. Called by the Oban job.
  """
  @spec run_occurrence(String.t(), DateTime.t(), module()) :: :ok | {:cancel, atom()}
  def run_occurrence(schedule_id, occurrence_at, date_service \\ DateService) do
    now = date_service.utc_now()

    case get_schedule(schedule_id) do
      nil ->
        {:cancel, :schedule_not_found}

      %OperationSchedule{next_run_at: next_run_at} = schedule ->
        if next_run_at && DateTime.compare(next_run_at, occurrence_at) == :eq do
          schedule
          |> attempt_request(occurrence_at, now)
          |> log_attempt(schedule, occurrence_at)

          advance(schedule, occurrence_at, now)
        else
          {:cancel, :stale_occurrence}
        end
    end
  end

  defp attempt_request(%OperationSchedule{} = schedule, occurrence_at, now) do
    operation = String.to_existing_atom(schedule.operation)

    with :ok <- check_on_time(occurrence_at, now),
         {:ok, user} <- check_creator(schedule.created_by_id, operation) do
      case Requests.request(schedule.target_type, schedule.target_id, operation, schedule.params) do
        {:ok, operation_id} -> {:requested, user, operation_id}
        {:error, :forbidden, errors} -> {:failed, user, "forbidden", errors}
        {:error, :not_found} -> {:failed, user, "target_not_found", []}
        {:error, reason} -> {:failed, user, "request_error", [inspect(reason)]}
      end
    end
  end

  defp check_on_time(occurrence_at, now) do
    if DateTime.diff(now, occurrence_at) > @late_tolerance_seconds,
      do: {:failed, nil, "trento_unavailable", []},
      else: :ok
  end

  defp check_creator(user_id, operation) do
    with {:ok, %User{locked_at: nil} = user} <- Users.get_user(user_id),
         true <- Trento.Hosts.Policy.authorize(operation, user, HostReadModel) do
      {:ok, user}
    else
      _ -> {:failed, nil, "unauthorized", []}
    end
  end

  defp log_attempt({:requested, user, operation_id}, schedule, occurrence_at) do
    log(
      actor(user, schedule),
      "scheduled_operation_requested",
      :info,
      schedule
      |> schedule_metadata()
      |> Map.merge(%{
        operation_id: operation_id,
        correlation_id: operation_id,
        occurrence_at: occurrence_at
      })
    )
  end

  defp log_attempt({:failed, user, reason, errors}, schedule, occurrence_at) do
    Logger.warning("Scheduled operation #{schedule.id} not requested: #{reason}")

    log(
      actor(user, schedule),
      "scheduled_operation_request_failed",
      :warning,
      schedule
      |> schedule_metadata()
      |> Map.merge(%{reason: reason, errors: errors, occurrence_at: occurrence_at})
    )
  end

  defp advance(%OperationSchedule{occurrences: occurrences} = schedule, occurrence_at, now) do
    # Missed occurrences are not caught up: the next one is after now
    next_run_at =
      Recurrence.next_occurrence(
        %{schedule | occurrences: occurrences + 1},
        Enum.max([occurrence_at, now], DateTime)
      )

    Multi.new()
    |> Multi.update(
      :schedule,
      Ecto.Changeset.change(schedule, occurrences: occurrences + 1, next_run_at: next_run_at)
    )
    |> maybe_insert_next_job(next_run_at)
    |> Repo.transaction()

    :ok
  end

  defp maybe_insert_next_job(multi, nil), do: multi

  defp maybe_insert_next_job(multi, _next_run_at),
    do: Oban.insert(multi, :job, fn %{schedule: schedule} -> occurrence_job(schedule) end)

  defp put_next_run_at(%Ecto.Changeset{valid?: false} = changeset, _now), do: changeset

  defp put_next_run_at(changeset, now) do
    case changeset |> Ecto.Changeset.apply_changes() |> Recurrence.next_occurrence(now) do
      nil -> Ecto.Changeset.add_error(changeset, :ends_on, "leaves no occurrence")
      next_run_at -> Ecto.Changeset.put_change(changeset, :next_run_at, next_run_at)
    end
  end

  defp occurrence_job(%OperationSchedule{id: id, next_run_at: next_run_at}) do
    ScheduledOperationJob.new(
      %{schedule_id: id, occurrence_at: DateTime.to_iso8601(next_run_at)},
      scheduled_at: next_run_at
    )
  end

  defp cancel_pending_jobs(schedule_id) do
    Oban.cancel_all_jobs(
      from j in Oban.Job,
        where:
          j.worker == ^inspect(ScheduledOperationJob) and
            fragment("?->>'schedule_id' = ?", j.args, ^schedule_id)
    )
  end

  defp transaction(multi) do
    case Repo.transaction(multi) do
      {:ok, %{schedule: schedule}} -> {:ok, schedule}
      {:error, _step, %Ecto.Changeset{} = changeset, _} -> {:error, changeset}
    end
  end

  defp schedule_metadata(%OperationSchedule{} = schedule) do
    %{
      schedule_id: schedule.id,
      correlation_id: schedule.id,
      target_type: schedule.target_type,
      resource_id: schedule.target_id,
      host_id: schedule.target_id,
      operation: schedule.operation,
      params: schedule.params,
      starts_at: schedule.starts_at,
      timezone: schedule.timezone,
      frequency: schedule.frequency,
      interval: schedule.interval,
      weekdays: schedule.weekdays,
      ends_on: schedule.ends_on,
      max_occurrences: schedule.max_occurrences,
      next_run_at: schedule.next_run_at
    }
  end

  defp actor(%User{username: username}, _schedule), do: username

  defp actor(nil, %OperationSchedule{created_by_id: user_id}) do
    case Users.by_id(user_id) do
      {:ok, %User{username: username}} -> username
      _ -> "system"
    end
  end

  # Proof of concept: written directly, not through Trento.ActivityLog.ActivityCatalog
  defp log(actor, type, severity, metadata) do
    %ActivityLog{}
    |> ActivityLog.changeset(%{
      type: type,
      actor: actor,
      severity: SeverityLevel.severity_level_to_integer(severity),
      metadata: metadata
    })
    |> Repo.insert()
  end
end
