# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Schedules do
  @moduledoc """
  Operation schedules, event sourced. Changes are commands to the
  `Trento.Operations.Schedule` aggregate. Reads come from the
  operation_schedules read model, projected with strong consistency.

  The activity log entries come from the events.
  """

  import Ecto.Query, only: [from: 2]

  alias Trento.Operations.{OperationSchedule, Requests}
  alias Trento.Operations.Commands.ScheduleOperation
  alias Trento.Repo
  alias Trento.Support.{CommandedUtils, DateService}

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
          | {:error, any()}
  def create_schedule(attrs, actor, date_service \\ DateService) do
    with {:ok, schedule} <- validate(attrs, actor, date_service),
         {:ok, warnings} <- policy_warnings(schedule),
         schedule_id = UUID.uuid4(),
         :ok <- dispatch(schedule_command(schedule_id, schedule, actor), schedule_id) do
      {:ok, Repo.get!(OperationSchedule, schedule_id), warnings}
    end
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

  defp validate(attrs, actor, date_service) do
    %OperationSchedule{}
    |> OperationSchedule.changeset(Map.put(attrs, :created_by, actor), date_service.utc_now())
    |> Ecto.Changeset.apply_action(:insert)
  end

  defp schedule_command(schedule_id, %OperationSchedule{} = schedule, actor) do
    ScheduleOperation.new!(%{
      schedule_id: schedule_id,
      target_type: schedule.target_type,
      target_id: schedule.target_id,
      operation: schedule.operation,
      params: schedule.params,
      starts_at: schedule.starts_at,
      timezone: schedule.timezone,
      recurrence: OperationSchedule.recurrence(schedule),
      next_run_at: schedule.next_run_at,
      bulk_id: schedule.bulk_id,
      actor: actor
    })
  end

  defp dispatch(command, correlation_id) do
    CommandedUtils.dispatch(command,
      consistency: :strong,
      correlation_id: correlation_id,
      causation_id: correlation_id
    )
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
