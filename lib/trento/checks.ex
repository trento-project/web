# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Checks do
  @moduledoc """
  Periodic checks of the hosts and clusters, at the global checks frequency.
  """

  import Ecto.Query, only: [from: 2, select: 3, where: 3]

  alias Trento.Checks.{ChecksExecutionRequest, Frequency}
  alias Trento.Clusters
  alias Trento.Clusters.Projections.ClusterReadModel
  alias Trento.Hosts
  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.Repo
  alias Trento.Settings
  alias Trento.Settings.ChecksFrequencySettings
  alias Trento.Support.DateService

  require Logger

  # The job runs every minute, a little earlier or later each time. Without a tolerance,
  # every 5 minutes could become every 6 minutes.
  @due_tolerance_seconds 30

  @doc """
  Requests a checks execution for every registered host and checkable cluster with selected
  checks that was never requested, or last requested at least one checks frequency ago.
  Does nothing when the periodic checks are disabled. A failed request is logged and retried
  at the next call.
  """
  @spec request_due_executions(module()) :: :ok
  def request_due_executions(date_service \\ DateService) do
    {:ok, %ChecksFrequencySettings{} = settings} = Settings.get_checks_frequency_settings()

    request_due_executions(settings, date_service.utc_now())
  end

  @doc """
  Deletes the requests of the hosts and clusters that are deregistered or removed, and
  returns how many it deleted.
  """
  @spec delete_stale_execution_requests() :: non_neg_integer()
  def delete_stale_execution_requests do
    registered_hosts = from h in HostReadModel, where: is_nil(h.deregistered_at), select: h.id

    registered_clusters =
      from c in ClusterReadModel, where: is_nil(c.deregistered_at), select: c.id

    {deleted, _} =
      Repo.delete_all(
        from r in ChecksExecutionRequest,
          where:
            (r.target_type == ^:host and r.target_id not in subquery(registered_hosts)) or
              (r.target_type == ^:cluster and r.target_id not in subquery(registered_clusters))
      )

    deleted
  end

  defp request_due_executions(%ChecksFrequencySettings{enabled: false}, _now), do: :ok

  defp request_due_executions(%ChecksFrequencySettings{enabled: true, frequency: frequency}, now) do
    requested_before =
      DateTime.add(now, @due_tolerance_seconds - Frequency.to_minutes(frequency) * 60)

    for {target_type, target_id} <- due_targets(requested_before) do
      request_execution(target_type, target_id, now)
    end

    :ok
  end

  defp due_targets(requested_before) do
    hosts =
      HostReadModel
      |> due(requested_before)
      |> select([h], {:host, h.id})

    clusters =
      ClusterReadModel
      |> due(requested_before)
      |> where([c], c.type in ^Clusters.checkable_cluster_types())
      |> select([c], {:cluster, c.id})

    Repo.all(hosts) ++ Repo.all(clusters)
  end

  # Registered targets with selected checks, never requested or last requested before the
  # given time
  defp due(read_model, requested_before) do
    from t in read_model,
      left_join: r in ChecksExecutionRequest,
      on: r.target_id == t.id,
      where:
        is_nil(t.deregistered_at) and t.selected_checks != ^[] and
          (is_nil(r.last_requested_at) or r.last_requested_at <= ^requested_before)
  end

  defp request_execution(target_type, target_id, now) do
    case request_checks_execution(target_type, target_id) do
      :ok ->
        Repo.insert!(
          %ChecksExecutionRequest{
            target_id: target_id,
            target_type: target_type,
            last_requested_at: now
          },
          on_conflict: {:replace, [:last_requested_at, :updated_at]},
          conflict_target: :target_id
        )

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
