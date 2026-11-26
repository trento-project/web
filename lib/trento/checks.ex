# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Checks do
  @moduledoc """
  Periodic checks executions of the hosts and clusters.
  """

  import Ecto.Query, only: [from: 2]

  alias Trento.Checks.{ChecksExecutionRequest, Events, Frequency, TargetSettings}
  alias Trento.Clusters
  alias Trento.Clusters.Projections.ClusterReadModel
  alias Trento.Hosts
  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.Repo
  alias Trento.Settings
  alias Trento.Settings.ChecksFrequencySettings
  alias Trento.Support.DateService

  require Logger

  # The jobs run every minute, a little earlier or later each time. Without a tolerance,
  # every 5 minutes could turn into every 6 minutes.
  @due_tolerance_seconds 30

  @doc """
  Requests a checks execution for the registered hosts, or checkable clusters, with selected
  checks that are due by their effective settings: their own, or else the global ones. A
  target is due when it was never requested or was last requested at least one frequency
  ago. Targets whose effective settings are disabled are skipped. A failed request is logged
  and retried at the next call.
  """
  @spec request_due_executions(:host | :cluster, module()) :: :ok
  def request_due_executions(target_type, date_service \\ DateService) do
    {:ok, settings} = Settings.get_checks_frequency_settings()

    request_due_executions(target_type, settings, date_service)
  end

  @doc """
  Deletes the requests of the hosts and clusters that are deregistered or removed, and
  returns how many it deleted. The requests made since it started are kept, because their
  target was restored in the meantime.
  """
  @spec delete_stale_execution_requests(module()) :: non_neg_integer()
  def delete_stale_execution_requests(date_service \\ DateService) do
    started_at = date_service.utc_now()
    # get_all_hosts() and get_all_clusters() return all non deregistered entries
    host_ids = Enum.map(Hosts.get_all_hosts(), & &1.id)
    cluster_ids = Enum.map(Clusters.get_all_clusters(), & &1.id)

    {deleted, _} =
      Repo.delete_all(
        from r in ChecksExecutionRequest,
          where:
            (r.target_type == ^:host and r.target_id not in ^host_ids) or
              (r.target_type == ^:cluster and r.target_id not in ^cluster_ids),
          where: r.last_requested_at < ^started_at
      )

    deleted
  end

  @doc """
  Subscribes the calling process to the events of the periodic checks executions, see
  `Trento.Checks.Events`.
  """
  @spec subscribe_to_events() :: :ok | {:error, term()}
  defdelegate subscribe_to_events, to: Events, as: :subscribe

  @doc """
  Returns the checks frequency settings of a host or cluster, or nil when it uses the global ones.
  """
  @spec get_target_settings(String.t()) :: TargetSettings.t() | nil
  def get_target_settings(target_id), do: Repo.get(TargetSettings, target_id)

  @doc """
  Stores the checks frequency settings of a host or cluster, replacing the previous ones.
  """
  @spec put_target_settings(:host | :cluster, String.t(), map()) ::
          {:ok, TargetSettings.t()} | {:error, Ecto.Changeset.t()}
  def put_target_settings(target_type, target_id, attrs) do
    %TargetSettings{target_id: target_id, target_type: target_type}
    |> TargetSettings.changeset(attrs)
    |> Repo.insert(
      on_conflict: {:replace, [:enabled, :frequency, :updated_at]},
      conflict_target: :target_id,
      returning: true
    )
  end

  @doc """
  Deletes the checks frequency settings of a host or cluster, so that it uses the global ones.
  """
  @spec delete_target_settings(String.t()) :: :ok
  def delete_target_settings(target_id) do
    Repo.delete_all(from s in TargetSettings, where: s.target_id == ^target_id)

    :ok
  end

  @doc """
  The settings in use for a target: its own, or else the global ones.
  """
  @spec effective_settings(TargetSettings.t() | nil, ChecksFrequencySettings.t()) :: %{
          enabled: boolean(),
          frequency: Frequency.t() | nil
        }
  def effective_settings(%TargetSettings{enabled: enabled, frequency: frequency}, _global),
    do: %{enabled: enabled, frequency: frequency}

  def effective_settings(nil, %ChecksFrequencySettings{enabled: enabled, frequency: frequency}),
    do: %{enabled: enabled, frequency: frequency}

  @doc """
  When the checks of a target are due, given its effective settings and the time of its
  last periodic request: nil when they do not run periodically, :now when the target was
  never requested.
  """
  @spec due_at(%{enabled: boolean(), frequency: Frequency.t() | nil}, DateTime.t() | nil) ::
          DateTime.t() | :now | nil
  def due_at(%{enabled: false}, _last_requested_at), do: nil
  def due_at(%{frequency: nil}, _last_requested_at), do: nil
  def due_at(_effective, nil), do: :now

  def due_at(%{frequency: frequency}, last_requested_at),
    do:
      DateTime.add(
        last_requested_at,
        Frequency.to_minutes(frequency) * 60 - @due_tolerance_seconds
      )

  @doc """
  Whether the checks are due at the given time.
  """
  @spec due?(DateTime.t() | :now | nil, DateTime.t()) :: boolean()
  def due?(nil, _now), do: false
  def due?(:now, _now), do: true
  def due?(due_at, now), do: DateTime.compare(due_at, now) != :gt

  @doc """
  The next periodic execution: the first full minute, when the jobs run, at or after the
  due time, or nil when the checks do not run periodically.
  """
  @spec next_execution_at(DateTime.t() | :now | nil, DateTime.t()) :: DateTime.t() | nil
  def next_execution_at(nil, _now), do: nil
  def next_execution_at(:now, now), do: next_full_minute(now)

  def next_execution_at(due_at, now) do
    case DateTime.compare(due_at, now) do
      :gt -> next_full_minute(due_at)
      _ -> next_full_minute(now)
    end
  end

  defp next_full_minute(%DateTime{second: 0, microsecond: {0, _}} = time), do: time

  defp next_full_minute(%DateTime{microsecond: {_, precision}} = time),
    do: DateTime.add(%DateTime{time | second: 0, microsecond: {0, precision}}, 60)

  defp request_due_executions(target_type, global, date_service) do
    now = date_service.utc_now()

    target_type
    |> candidates()
    |> Enum.filter(fn {_target_id, target_settings, last_requested_at} ->
      target_settings
      |> effective_settings(global)
      |> due_at(last_requested_at)
      |> due?(now)
    end)
    |> Enum.each(fn {target_id, _, _} ->
      request_execution(target_type, target_id, date_service)
    end)
  end

  # The targets whose checks can run, each with its own settings and the time of its last
  # periodic request
  defp candidates(target_type) do
    Repo.all(
      from t in eligible_targets(target_type),
        left_join: s in TargetSettings,
        on: s.target_id == t.id,
        left_join: r in ChecksExecutionRequest,
        on: r.target_id == t.id,
        select: {t.id, s, r.last_requested_at}
    )
  end

  # Registered targets with selected checks. A cluster also has a checkable type and a
  # registered host
  defp eligible_targets(:host),
    do: from(h in HostReadModel, where: is_nil(h.deregistered_at) and h.selected_checks != ^[])

  defp eligible_targets(:cluster) do
    from c in ClusterReadModel,
      where:
        is_nil(c.deregistered_at) and c.selected_checks != ^[] and
          c.type in ^Clusters.checkable_cluster_types() and
          c.id in subquery(clusters_with_registered_hosts())
  end

  defp clusters_with_registered_hosts,
    do: from(h in HostReadModel, where: is_nil(h.deregistered_at), select: h.cluster_id)

  defp request_execution(target_type, target_id, date_service) do
    case request_checks_execution(target_type, target_id) do
      :ok ->
        requested_at = date_service.utc_now()

        Repo.insert!(
          %ChecksExecutionRequest{
            target_id: target_id,
            target_type: target_type,
            last_requested_at: requested_at
          },
          on_conflict: {:replace, [:last_requested_at, :updated_at]},
          conflict_target: :target_id
        )

        Events.broadcast_execution_requested(target_type, target_id, requested_at)

      {:error, reason} ->
        Logger.error(
          "Failed to request checks execution, #{target_type}: #{target_id}, " <>
            "reason: #{inspect(reason)}"
        )
    end
  end

  defp request_checks_execution(:host, host_id), do: Hosts.request_checks_execution(host_id)

  defp request_checks_execution(:cluster, cluster_id),
    do: Clusters.request_checks_execution(cluster_id)
end
