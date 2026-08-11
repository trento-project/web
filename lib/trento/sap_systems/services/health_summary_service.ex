# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.SapSystems.Services.HealthSummaryService do
  @moduledoc """
  Provides a set of functions to interact with SAP systems Health Summary
  """

  import Ecto.Query

  alias Trento.Databases.Projections.DatabaseInstanceReadModel

  alias Trento.SapSystems.Projections.{
    ApplicationInstanceReadModel,
    SapSystemReadModel
  }

  alias Trento.Clusters.Projections.ClusterReadModel

  alias Trento.Enums.Health
  alias Trento.SapSystems.Services.HealthService, as: SapSystemsHealthService
  alias Trento.Services.HealthService

  alias Trento.Repo

  @spec get_health_summary :: [map()]
  def get_health_summary do
    SapSystemReadModel
    |> where([s], is_nil(s.deregistered_at))
    |> order_by(asc: :sid)
    |> Repo.all()
    |> Repo.preload([
      :database,
      [application_instances: [host: :cluster]],
      [database_instances: [host: :cluster]]
    ])
    |> Enum.map(&summary_from_sap_system/1)
  end

  @spec summary_from_sap_system(SapSystemReadModel.t()) :: map()
  defp summary_from_sap_system(%SapSystemReadModel{
         id: id,
         sid: sid,
         health: health,
         application_instances: application_instances,
         database_instances: database_instances,
         database: %{health: database_health, sid: database_sid, stale_at: database_stale_at},
         database_id: database_id
       }) do
    hosts =
      application_instances
      |> Enum.concat(database_instances)
      |> Enum.map(fn %{host: host} -> host end)
      |> Enum.reject(&is_nil/1)

    application_cluster = get_cluster_from_instances(application_instances)
    database_cluster = get_cluster_from_instances(database_instances)

    %{
      # SAP system
      id: id,
      sid: sid,
      sapsystem_health: health,
      # Application
      application_health: compute_application_health(application_instances),
      application_stale_at: compute_items_stale_at(application_instances),
      # Application cluster
      application_cluster_id: Map.get(application_cluster, :id),
      application_cluster_health: Map.get(application_cluster, :health),
      application_cluster_stale_at: Map.get(application_cluster, :stale_at),
      # Database
      database_id: database_id,
      database_sid: database_sid,
      database_health: database_health,
      database_stale_at: database_stale_at,
      # Database cluster
      database_cluster_id: Map.get(database_cluster, :id),
      database_cluster_health: Map.get(database_cluster, :health),
      database_cluster_stale_at: Map.get(database_cluster, :stale_at),
      # Hosts
      hosts_health: compute_hosts_health(hosts),
      hosts_stale_at: compute_items_stale_at(hosts)
    }
  end

  @spec get_cluster_from_instances(
          [DatabaseInstanceReadModel.t()]
          | [ApplicationInstanceReadModel.t()]
        ) :: ClusterReadModel.t() | map()
  defp get_cluster_from_instances(instances) do
    Enum.find_value(instances, %{}, fn
      %{host: %{cluster: %ClusterReadModel{} = cluster}} -> cluster
      _ -> false
    end)
  end

  @spec compute_hosts_health([DatabaseInstanceReadModel.t() | ApplicationInstanceReadModel.t()]) ::
          Health.t()
  defp compute_hosts_health(hosts) do
    hosts
    |> Enum.map(fn %{health: health} -> health end)
    |> Enum.filter(& &1)
    |> HealthService.compute_aggregated_health()
  end

  defp compute_application_health(application_instances),
    do:
      application_instances
      |> Enum.map(fn %{status: status} ->
        SapSystemsHealthService.derive_health_from_status(status)
      end)
      |> HealthService.compute_aggregated_health()

  defp compute_items_stale_at(items),
    do:
      items
      |> Enum.map(fn %{stale_at: stale_at} -> stale_at end)
      |> Enum.reject(&is_nil/1)
      |> Enum.min(DateTime, fn -> nil end)
end
