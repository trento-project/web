# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Checks do
  @moduledoc """
  Periodic checks executions of the hosts and clusters.
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

  # The jobs run every minute, a little earlier or later each time. Without a tolerance,
  # every 5 minutes could turn into every 6 minutes.
  @due_tolerance_seconds 30

  @doc """
  Requests a checks execution for the registered hosts, or checkable clusters, with selected
  checks that were never requested or were last requested at least one checks frequency ago.
  Nothing is requested while the periodic checks are disabled. A failed request is logged and
  retried at the next call.
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

  defp request_due_executions(_target_type, %ChecksFrequencySettings{enabled: false}, _),
    do: :ok

  defp request_due_executions(
         target_type,
         %ChecksFrequencySettings{enabled: true, frequency: frequency},
         date_service
       ) do
    requested_before =
      DateTime.add(
        date_service.utc_now(),
        @due_tolerance_seconds - Frequency.to_minutes(frequency) * 60
      )

    target_type
    |> due_targets(requested_before)
    |> Enum.each(&request_execution(target_type, &1, date_service))
  end

  defp due_targets(:host, requested_before) do
    HostReadModel
    |> due(requested_before)
    |> select([h], h.id)
    |> Repo.all()
  end

  defp due_targets(:cluster, requested_before) do
    ClusterReadModel
    |> due(requested_before)
    |> where([c], c.type in ^Clusters.checkable_cluster_types())
    |> where([c], c.id in subquery(clusters_with_registered_hosts()))
    |> select([c], c.id)
    |> Repo.all()
  end

  defp clusters_with_registered_hosts,
    do: from(h in HostReadModel, where: is_nil(h.deregistered_at), select: h.cluster_id)

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

  defp request_execution(target_type, target_id, date_service) do
    case request_checks_execution(target_type, target_id) do
      :ok ->
        Repo.insert!(
          %ChecksExecutionRequest{
            target_id: target_id,
            target_type: target_type,
            last_requested_at: date_service.utc_now()
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
