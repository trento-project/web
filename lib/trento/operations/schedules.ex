# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Schedules do
  @moduledoc """
  Operation schedules stored in the database. A Quantum job runs the due ones,
  see `Trento.Operations.Scheduler`.
  """

  alias Ecto.Multi
  alias Trento.Operations.{OperationSchedule, Requests, ScheduleActivity}
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
         {:ok, %{schedule: schedule}} <- insert(changeset, actor) do
      {:ok, schedule, warnings}
    end
  end

  defp insert(changeset, actor) do
    Multi.new()
    |> Multi.insert(:schedule, changeset)
    |> Multi.insert(:activity, fn %{schedule: schedule} ->
      ScheduleActivity.changeset("operation_scheduled", schedule, actor)
    end)
    |> Repo.transaction()
    |> case do
      {:ok, result} -> {:ok, result}
      {:error, _, changeset, _} -> {:error, changeset}
    end
  end

  defp policy_warnings(%OperationSchedule{} = schedule) do
    {:ok, target_type, operation} = Requests.parse(schedule.target_type, schedule.operation)

    case Requests.authorize(target_type, schedule.target_id, operation, schedule.params) do
      :ok -> {:ok, []}
      {:error, :forbidden, errors} -> {:ok, errors}
      {:error, :not_found} -> {:error, :not_found}
    end
  end
end
