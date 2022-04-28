defmodule Trento.SapSystems.HealthSummaryService do
  @moduledoc """
  Provides a set of functions to interact with SAP systems Health Summary
  """

  alias Trento.{
    ApplicationInstanceReadModel,
    ClusterReadModel,
    DatabaseInstanceReadModel,
    SapSystemReadModel
  }

  alias Trento.Domain.Health
  alias Trento.Domain.HealthService

  alias Trento.Application.UseCases.SapSystems.HealthSummaryDto
  alias Trento.Repo

  import Ecto.Query

  @type instance_list :: [DatabaseInstanceReadModel.t() | ApplicationInstanceReadModel.t()]

  @spec get_health_summary :: [HealthSummaryDto.t()]
  def get_health_summary do
    SapSystemReadModel
    |> order_by(asc: :sid)
    |> Repo.all()
    |> Repo.preload(application_instances: :host)
    |> Repo.preload(database_instances: :host)
    |> Enum.map(&sap_system_to_summary/1)
  end

  @spec sap_system_to_summary(SapSystemReadModel.t()) :: HealthSummaryDto.t()
  defp sap_system_to_summary(%SapSystemReadModel{
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
      clusters_health: compute_clusters_health(all_instances),
      hosts_health: compute_hosts_health(all_instances)
    }
    |> HealthSummaryDto.new!()
  end

  @spec compute_database_health([DatabaseInstanceReadModel.t()]) :: Health.t()
  defp compute_database_health(database_instances) do
    database_instances
    |> Enum.map(fn %{health: health} -> health end)
    |> HealthService.compute_aggregated_health()
  end

  @spec compute_clusters_health(instance_list) ::
          Health.t()
  defp compute_clusters_health(instances) do
    instances
    |> reject_unclustered_instances()
    |> clusters_from_instance()
    |> keep_only_hana_scale_up_clusters()
    |> health_from_cluster()
    |> HealthService.compute_aggregated_health()
  end

  @spec clusters_from_instance(instance_list) :: [ClusterReadModel.t()]
  defp clusters_from_instance(instances) do
    instances
    |> Enum.filter(fn %{host: host} -> host end)
    |> Enum.map(fn %{host: %{cluster_id: cluster_id}} -> cluster_id end)
    |> Enum.uniq()
    |> Enum.map(fn cluster_id -> Repo.get!(ClusterReadModel, cluster_id) end)
  end

  @spec health_from_cluster([ClusterReadModel.t()]) :: [String.t()]
  defp health_from_cluster(clusters) do
    Enum.map(clusters, fn %ClusterReadModel{health: health} -> health end)
  end

  @spec reject_unclustered_instances(instance_list) :: instance_list
  defp reject_unclustered_instances(instances) do
    Enum.reject(instances, fn
      %{host: %{cluster_id: nil}} -> true
      _ -> false
    end)
  end

  @spec keep_only_hana_scale_up_clusters([ClusterReadModel.t()]) :: [ClusterReadModel.t()]
  defp keep_only_hana_scale_up_clusters(clusters) do
    Enum.filter(clusters, fn
      %ClusterReadModel{type: :hana_scale_up} -> true
      _ -> false
    end)
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
