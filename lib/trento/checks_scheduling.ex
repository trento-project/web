# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.ChecksScheduling do
  @moduledoc """
  Periodic checks execution for hosts and clusters.

  Every minute `request_due_executions/1` requests a checks execution for each
  target whose interval elapsed since the last periodic request.
  The interval of a target is, in order of precedence:
  the interval set for the target, the global interval set from the environment,
  the global interval saved in the settings, the default interval.

  No execution is requested for a target inside one of its exception windows.
  """

  import Ecto.Query

  require Logger

  alias Trento.ChecksScheduling.{ExceptionWindow, TargetSchedule}
  alias Trento.{Clusters, Hosts, Repo, Settings}
  alias Trento.Clusters.Projections.ClusterReadModel
  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.Support.DateService

  @type target_type :: :host | :cluster

  @spec request_due_executions(module()) :: :ok
  def request_due_executions(date_service \\ DateService) do
    now = date_service.utc_now()
    tick = floor_to_minute(now)
    {:ok, %{interval: global_interval}} = Settings.get_checks_execution_settings()
    schedules = TargetSchedule |> Repo.all() |> Map.new(&{&1.target_id, &1})
    windows = ExceptionWindow |> Repo.all() |> Enum.group_by(& &1.target_id)

    Enum.each(schedulable_targets(), fn {target_id, target_type} ->
      schedule = Map.get(schedules, target_id)
      interval = (schedule && schedule.interval) || global_interval

      cond do
        Enum.any?(Map.get(windows, target_id, []), &ExceptionWindow.active?(&1, now)) ->
          :skipped

        due?(schedule, interval, tick) ->
          request_execution(target_id, target_type, tick)

        true ->
          :not_due
      end
    end)
  end

  @spec in_exception_window?(String.t(), DateTime.t()) :: boolean()
  def in_exception_window?(target_id, at \\ DateTime.utc_now()) do
    from(w in ExceptionWindow, where: w.target_id == ^target_id)
    |> Repo.all()
    |> Enum.any?(&ExceptionWindow.active?(&1, at))
  end

  @spec get_target_schedule(String.t()) :: %{
          interval: pos_integer() | nil,
          last_scheduled_at: DateTime.t() | nil,
          exception_windows: [ExceptionWindow.t()]
        }
  def get_target_schedule(target_id) do
    schedule = Repo.get(TargetSchedule, target_id) || %TargetSchedule{}

    windows =
      Repo.all(
        from w in ExceptionWindow,
          where: w.target_id == ^target_id,
          order_by: [asc: w.starts_at]
      )

    %{
      interval: schedule.interval,
      last_scheduled_at: schedule.last_scheduled_at,
      exception_windows: windows
    }
  end

  @spec set_target_interval(String.t(), target_type(), pos_integer() | nil) ::
          {:ok, TargetSchedule.t()} | {:error, Ecto.Changeset.t()}
  def set_target_interval(target_id, target_type, interval) do
    (Repo.get(TargetSchedule, target_id) || %TargetSchedule{})
    |> TargetSchedule.changeset(%{
      target_id: target_id,
      target_type: target_type,
      interval: interval
    })
    |> Repo.insert_or_update()
  end

  @spec add_exception_window(String.t(), target_type(), map()) ::
          {:ok, ExceptionWindow.t()} | {:error, Ecto.Changeset.t()}
  def add_exception_window(target_id, target_type, attrs) do
    %ExceptionWindow{}
    |> ExceptionWindow.changeset(
      Map.merge(attrs, %{target_id: target_id, target_type: target_type})
    )
    |> Repo.insert()
  end

  @spec delete_exception_window(String.t(), String.t()) :: :ok | {:error, :not_found}
  def delete_exception_window(target_id, window_id) do
    case Repo.delete_all(
           from w in ExceptionWindow, where: w.id == ^window_id and w.target_id == ^target_id
         ) do
      {1, _} -> :ok
      {0, _} -> {:error, :not_found}
    end
  end

  defp schedulable_targets do
    clusters =
      Repo.all(
        from c in ClusterReadModel,
          select: {c.id, :cluster},
          where:
            c.type in ^Clusters.checkable_cluster_types() and is_nil(c.deregistered_at) and
              fragment("cardinality(?) > 0", c.selected_checks)
      )

    hosts =
      Repo.all(
        from h in HostReadModel,
          select: {h.id, :host},
          where: is_nil(h.deregistered_at) and fragment("cardinality(?) > 0", h.selected_checks)
      )

    clusters ++ hosts
  end

  defp due?(nil, _interval, _tick), do: true
  defp due?(%TargetSchedule{last_scheduled_at: nil}, _interval, _tick), do: true

  defp due?(%TargetSchedule{last_scheduled_at: last_scheduled_at}, interval, tick),
    do: DateTime.diff(tick, last_scheduled_at, :minute) >= interval

  defp request_execution(target_id, target_type, tick) do
    case do_request_execution(target_id, target_type) do
      :ok ->
        Repo.insert!(
          %TargetSchedule{
            target_id: target_id,
            target_type: target_type,
            last_scheduled_at: tick
          },
          on_conflict: [set: [last_scheduled_at: tick, updated_at: DateTime.utc_now()]],
          conflict_target: :target_id
        )

        :requested

      {:error, reason} ->
        Logger.error(
          "Failed to request checks execution, #{target_type}: #{target_id}, reason: #{inspect(reason)}"
        )

        :failed
    end
  end

  defp do_request_execution(target_id, :cluster), do: Clusters.request_checks_execution(target_id)
  defp do_request_execution(target_id, :host), do: Hosts.request_checks_execution(target_id)

  defp floor_to_minute(%DateTime{} = datetime),
    do: %DateTime{datetime | second: 0, microsecond: {0, 6}}
end
