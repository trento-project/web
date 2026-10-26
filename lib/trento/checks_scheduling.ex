# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.ChecksScheduling do
  @moduledoc """
  Periodic checks executions of hosts and clusters.

  A target uses its own interval, or the global one of
  `Trento.Settings.get_checks_execution_settings/0`. No periodic execution
  runs during its exception window.
  """

  import Ecto.Query, only: [from: 2]

  alias Trento.{Clusters, Hosts}
  alias Trento.ChecksScheduling.{Interval, TargetSchedule}
  alias Trento.Clusters.Projections.ClusterReadModel
  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.Repo
  alias Trento.Scheduling.Recurrence
  alias Trento.Settings
  alias Trento.Support.DateService

  require Logger

  @type target_type :: :host | :cluster

  @spec get_target_schedule(target_type(), String.t(), module()) ::
          {:ok, map()} | {:error, :not_found}
  def get_target_schedule(target_type, target_id, date_service \\ DateService) do
    with :ok <- target_exists(target_type, target_id) do
      {:ok, view(load(target_type, target_id), date_service.utc_now())}
    end
  end

  @spec update_target_schedule(target_type(), String.t(), map(), module()) ::
          {:ok, map()} | {:error, :not_found} | {:error, Ecto.Changeset.t()}
  def update_target_schedule(target_type, target_id, attrs, date_service \\ DateService) do
    now = date_service.utc_now()

    with :ok <- target_exists(target_type, target_id),
         {:ok, schedule} <-
           target_type
           |> load(target_id)
           |> TargetSchedule.changeset(attrs, now)
           |> Repo.insert_or_update() do
      {:ok, view(schedule, now)}
    end
  end

  @doc """
  Requests a checks execution for every host and cluster with selected checks
  whose interval elapsed, outside its exception window. A Quantum job calls it
  every minute.

  When the previous execution of a target still runs, Wanda refuses the new
  request: executions do not pile up.
  """
  @spec request_due_executions(module()) :: :ok
  def request_due_executions(date_service \\ DateService) do
    now = date_service.utc_now()
    schedules = Map.new(Repo.all(TargetSchedule), &{&1.target_id, &1})

    for {target_type, target_id} <- targets_with_checks(),
        schedule = Map.get(schedules, target_id) || new_schedule(target_type, target_id),
        due?(schedule, now) do
      request(target_type, target_id, now)
    end

    :ok
  end

  @spec in_exception_window?(String.t(), module()) :: boolean()
  def in_exception_window?(target_id, date_service \\ DateService) do
    case Repo.get(TargetSchedule, target_id) do
      nil -> false
      schedule -> not is_nil(window_end(schedule, date_service.utc_now()))
    end
  end

  @doc """
  The interval that applies to the target.
  """
  @spec effective_interval(TargetSchedule.t()) :: Interval.t()
  def effective_interval(%TargetSchedule{interval: nil}),
    do: Settings.get_checks_execution_settings().interval

  def effective_interval(%TargetSchedule{interval: interval}), do: interval

  @doc """
  The end of the exception window occurrence covering `at`, nil outside the window.
  """
  @spec window_end(TargetSchedule.t(), DateTime.t()) :: DateTime.t() | nil
  def window_end(%TargetSchedule{} = schedule, at) do
    with %{} = window <- TargetSchedule.window_recurrence(schedule),
         duration = schedule.window_duration_minutes,
         from = DateTime.add(at, -duration * 60 - 1, :second),
         %DateTime{} = start <- Recurrence.next_occurrence(window, from),
         true <- DateTime.compare(start, at) != :gt,
         ends_at = DateTime.add(start, duration, :minute),
         :gt <- DateTime.compare(ends_at, at) do
      ends_at
    else
      _ -> nil
    end
  end

  @doc """
  When the next periodic execution runs, nil when they are disabled.
  """
  @spec next_execution_at(TargetSchedule.t(), DateTime.t()) :: DateTime.t() | nil
  def next_execution_at(%TargetSchedule{} = schedule, now) do
    case Interval.to_minutes(effective_interval(schedule)) do
      nil ->
        nil

      minutes ->
        due =
          case schedule.last_requested_at do
            nil -> now
            last -> Enum.max([DateTime.add(last, minutes, :minute), now], DateTime)
          end

        window_end(schedule, due) || due
    end
  end

  defp due?(%TargetSchedule{} = schedule, now) do
    case Interval.to_minutes(effective_interval(schedule)) do
      nil ->
        false

      minutes ->
        is_nil(window_end(schedule, now)) and
          (is_nil(schedule.last_requested_at) or
             DateTime.compare(DateTime.add(schedule.last_requested_at, minutes, :minute), now) !=
               :gt)
    end
  end

  defp request(target_type, target_id, now) do
    case request_execution(target_type, target_id) do
      :ok ->
        Repo.insert!(
          %TargetSchedule{
            target_id: target_id,
            target_type: Atom.to_string(target_type),
            last_requested_at: now
          },
          on_conflict: [set: [last_requested_at: now, updated_at: now]],
          conflict_target: :target_id
        )

      {:error, reason} ->
        Logger.error(
          "Could not request the checks execution of #{target_type} #{target_id}: #{inspect(reason)}"
        )
    end
  end

  defp request_execution(:host, host_id), do: Hosts.request_checks_execution(host_id)
  defp request_execution(:cluster, cluster_id), do: Clusters.request_checks_execution(cluster_id)

  defp targets_with_checks do
    hosts =
      Repo.all(
        from h in HostReadModel,
          where: is_nil(h.deregistered_at) and fragment("cardinality(?) > 0", h.selected_checks),
          select: h.id
      )

    clusters =
      Repo.all(
        from c in ClusterReadModel,
          where: is_nil(c.deregistered_at) and fragment("cardinality(?) > 0", c.selected_checks),
          select: c.id
      )

    Enum.map(hosts, &{:host, &1}) ++ Enum.map(clusters, &{:cluster, &1})
  end

  defp new_schedule(target_type, target_id),
    do: %TargetSchedule{target_id: target_id, target_type: Atom.to_string(target_type)}

  defp view(%TargetSchedule{} = schedule, now) do
    %{
      interval: schedule.interval,
      effective_interval: effective_interval(schedule),
      global_interval: Settings.get_checks_execution_settings().interval,
      last_requested_at: schedule.last_requested_at,
      next_execution_at: next_execution_at(schedule, now),
      exception_window: TargetSchedule.exception_window(schedule),
      in_exception_window: not is_nil(window_end(schedule, now))
    }
  end

  defp load(target_type, target_id) do
    Repo.get(TargetSchedule, target_id) ||
      %TargetSchedule{target_id: target_id, target_type: Atom.to_string(target_type)}
  end

  defp target_exists(:host, host_id), do: registered(Repo.get(HostReadModel, host_id))
  defp target_exists(:cluster, cluster_id), do: registered(Repo.get(ClusterReadModel, cluster_id))

  defp registered(%{deregistered_at: nil}), do: :ok
  defp registered(_), do: {:error, :not_found}
end
