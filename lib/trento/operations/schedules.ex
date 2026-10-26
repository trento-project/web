# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Schedules do
  @moduledoc """
  Operation schedules stored in the database, each with an Oban job at its
  next occurrence.
  """

  import Ecto.Query, only: [from: 2]

  alias Ecto.Multi
  alias Trento.Operations.{OperationSchedule, Requests, ScheduleActivity, ScheduleJobs}
  alias Trento.Repo
  alias Trento.Support.DateService

  @type warnings :: [map()]

  @doc """
  Schedules an operation. The schedule is saved even when the operation
  policies fail now: they are returned as warnings and run again when the
  schedule is due.
  """
  @spec create_schedule(map(), String.t(), module()) ::
          {:ok, OperationSchedule.t(), warnings()}
          | {:error, :not_found}
          | {:error, Ecto.Changeset.t()}
  def create_schedule(attrs, actor, date_service \\ DateService) do
    changeset =
      OperationSchedule.changeset(
        %OperationSchedule{},
        Map.put(attrs, :created_by, actor),
        date_service.utc_now()
      )

    with {:ok, schedule} <- Ecto.Changeset.apply_action(changeset, :insert),
         {:ok, warnings} <- policy_warnings(schedule),
         {:ok, %{schedule: schedule}} <- persist(changeset, "operation_scheduled", actor) do
      {:ok, schedule, warnings}
    end
  end

  @doc """
  Replaces the params and the timing of a schedule. The occurrence count
  restarts. Failing operation policies come back as warnings.
  """
  @spec update_schedule(String.t(), map(), String.t(), module()) ::
          {:ok, OperationSchedule.t(), warnings()}
          | {:error, :not_found}
          | {:error, Ecto.Changeset.t()}
  def update_schedule(schedule_id, attrs, actor, date_service \\ DateService) do
    with {:ok, current} <- get_schedule(schedule_id),
         changeset = OperationSchedule.update_changeset(current, attrs, date_service.utc_now()),
         {:ok, schedule} <- Ecto.Changeset.apply_action(changeset, :update),
         {:ok, warnings} <- policy_warnings(schedule),
         {:ok, %{schedule: schedule}} <- persist(changeset, "operation_schedule_changed", actor) do
      {:ok, schedule, warnings}
    end
  end

  @doc """
  Cancels a schedule: it no longer runs. An operation already running is not affected.
  """
  @spec cancel_schedule(String.t(), String.t()) :: :ok | {:error, :not_found}
  def cancel_schedule(schedule_id, actor) do
    with {:ok, schedule} <- get_schedule(schedule_id) do
      delete([schedule], actor, %{})
    end
  end

  @doc """
  Cancels the schedules of a target that is removed. The entries are logged
  by the system and correlated to the clean up that removed the target.
  """
  @spec cancel_target_schedules(String.t(), String.t() | nil) :: :ok
  def cancel_target_schedules(target_id, correlation_id) do
    extra = if correlation_id, do: %{correlation_id: correlation_id}, else: %{}

    target_id
    |> list_schedules()
    |> delete("system", extra)
  end

  @doc """
  Lists the schedules of a target, the next one first.
  """
  @spec list_schedules(String.t()) :: [OperationSchedule.t()]
  def list_schedules(target_id) do
    Repo.all(
      from s in OperationSchedule,
        where: s.target_id == ^target_id,
        order_by: [asc: s.next_run_at, asc: s.inserted_at]
    )
  end

  @spec get_schedule(String.t()) :: {:ok, OperationSchedule.t()} | {:error, :not_found}
  def get_schedule(schedule_id) do
    case Repo.get(OperationSchedule, schedule_id) do
      nil -> {:error, :not_found}
      schedule -> {:ok, schedule}
    end
  end

  defp delete(schedules, actor, extra) do
    schedules
    |> Enum.reduce(Multi.new(), fn %OperationSchedule{id: id} = schedule, multi ->
      multi
      |> Multi.delete({:schedule, id}, schedule)
      |> ScheduleJobs.cancel({:job, id}, id)
      |> Multi.insert(
        {:activity, id},
        ScheduleActivity.changeset("operation_schedule_cancelled", schedule, actor, extra)
      )
    end)
    |> Repo.transaction()
    |> case do
      {:ok, _} -> :ok
      {:error, _, %Ecto.StaleEntryError{}, _} -> {:error, :not_found}
    end
  end

  defp persist(changeset, activity_type, actor) do
    Multi.new()
    |> Multi.insert_or_update(:schedule, changeset)
    |> Multi.insert(:activity, fn %{schedule: schedule} ->
      ScheduleActivity.changeset(activity_type, schedule, actor)
    end)
    |> cancel_previous_job(changeset)
    |> ScheduleJobs.insert(:job, :schedule)
    |> Repo.transaction()
    |> case do
      {:ok, result} -> {:ok, result}
      {:error, _, changeset, _} -> {:error, changeset}
    end
  end

  defp cancel_previous_job(multi, %Ecto.Changeset{data: %OperationSchedule{id: nil}}), do: multi

  defp cancel_previous_job(multi, %Ecto.Changeset{data: %OperationSchedule{id: id}}),
    do: ScheduleJobs.cancel(multi, :previous_job, id)

  defp policy_warnings(%OperationSchedule{} = schedule) do
    {:ok, target_type, operation} = Requests.parse(schedule.target_type, schedule.operation)

    case Requests.authorize(target_type, schedule.target_id, operation, schedule.params) do
      :ok -> {:ok, []}
      {:error, :forbidden, errors} -> {:ok, errors}
      {:error, :not_found} -> {:error, :not_found}
    end
  end
end
