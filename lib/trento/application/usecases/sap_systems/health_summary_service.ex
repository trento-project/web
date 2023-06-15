defmodule Trento.SapSystems.HealthSummaryService do
  @moduledoc """
  Provides a set of functions to interact with SAP systems Health Summary
  """

  import Ecto.Query

  require Trento.Domain.Enums.ClusterType, as: ClusterType

  alias Trento.{
    ApplicationInstanceReadModel,
    ClusterReadModel,
    DatabaseInstanceReadModel,
    SapSystemReadModel
  }

  alias Trento.Domain.Enums.Health
  alias Trento.Domain.HealthService

  alias Trento.Repo

  @type instance_list :: [DatabaseInstanceReadModel.t() | ApplicationInstanceReadModel.t()]

  @spec get_health_summary :: [map()]
  def get_health_summary do
    SapSystemReadModel
    |> where([s], is_nil(s.deregistered_at))
    |> order_by(asc: :sid)
    |> Repo.all()
    |> Repo.preload(application_instances: :host)
    |> Repo.preload(database_instances: :host)
    |> Enum.map(&summary_from_sap_system/1)
  end

  @spec summary_from_sap_system(SapSystemReadModel.t()) :: map()
  defp summary_from_sap_system(%SapSystemReadModel{
         id: id,
         sid: sid,
         health: health,
         application_instances: application_instances,
         database_instances: database_instances
       }) do
    all_instances = application_instances ++ database_instances

    %{
      id: id,
      sid: sid,
      sapsystem_health: health,
      database_health: compute_database_health(database_instances),
      application_cluster_health:
        compute_cluster_health(application_instances, [ClusterType.ascs_ers()]),
      database_cluster_health:
        compute_cluster_health(database_instances, [ClusterType.hana_scale_up()]),
      hosts_health: compute_hosts_health(all_instances),
      application_instances: application_instances,
      database_instances: database_instances
    }
  end

  @spec compute_database_health([DatabaseInstanceReadModel.t()]) :: Health.t()
  defp compute_database_health(database_instances) do
    database_instances
    |> Enum.map(fn %{health: health} -> health end)
    |> HealthService.compute_aggregated_health()
  end

  @spec compute_cluster_health(instance_list, [ClusterType.t()]) :: Health.t()
  defp compute_cluster_health(instances, cluster_types) do
    instances
    |> reject_unclustered_instances()
    |> clusters_from_instance()
    |> filter_by_cluster_type(cluster_types)
    |> health_from_cluster()
    |> HealthService.compute_aggregated_health()
  end

  @spec reject_unclustered_instances(instance_list) :: instance_list
  defp reject_unclustered_instances(instances) do
    Enum.reject(instances, fn
      %{host: %{cluster_id: nil}} -> true
      _ -> false
    end)
  end

  @spec clusters_from_instance(instance_list) :: [ClusterReadModel.t()]
  defp clusters_from_instance(instances) do
    instances
    |> Enum.filter(fn %{host: host} -> host end)
    |> Enum.map(fn %{host: %{cluster_id: cluster_id}} -> cluster_id end)
    |> Enum.uniq()
    |> Enum.map(fn cluster_id -> Repo.get!(ClusterReadModel, cluster_id) end)
  end

  @spec filter_by_cluster_type([ClusterReadModel.t()], [ClusterType.t()]) :: [
          ClusterReadModel.t()
        ]
  defp filter_by_cluster_type(clusters, cluster_types) do
    Enum.filter(clusters, fn
      %ClusterReadModel{type: type} -> type in cluster_types
      _ -> false
    end)
  end

  @spec health_from_cluster([ClusterReadModel.t()]) :: [String.t()]
  defp health_from_cluster(clusters) do
    Enum.map(clusters, fn %ClusterReadModel{health: health} -> health end)
  end

  @spec compute_hosts_health(instance_list) :: Health.t()
  defp compute_hosts_health(instances) do
    instances
    |> Enum.filter(fn %{host: host} -> host end)
    |> Enum.map(fn %{host: %{heartbeat: heartbeat}} -> heartbeat end)
    |> Enum.filter(& &1)
    |> HealthService.compute_aggregated_health()
  end
end
