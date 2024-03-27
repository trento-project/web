defmodule Trento.SapSystems.Services.HealthSummaryService do
  @moduledoc """
  Provides a set of functions to interact with SAP systems Health Summary
  """

  import Ecto.Query

  require Trento.Enums.Health, as: HealthEnum

  alias Trento.Databases.Projections.DatabaseInstanceReadModel

  alias Trento.SapSystems.Projections.{
    ApplicationInstanceReadModel,
    SapSystemReadModel
  }

  alias Trento.Clusters.Projections.ClusterReadModel

  alias Trento.Enums.Health
  alias Trento.Services.HealthService

  alias Trento.Repo

  @spec get_health_summary :: [map()]
  def get_health_summary do
    SapSystemReadModel
    |> where([s], is_nil(s.deregistered_at))
    |> order_by(asc: :sid)
    |> Repo.all()
    |> Repo.preload(application_instances: :host)
    |> Repo.preload(database_instances: :host)
    |> Repo.preload(:database)
    |> Enum.map(&summary_from_sap_system/1)
  end

  @spec summary_from_sap_system(SapSystemReadModel.t()) :: map()
  defp summary_from_sap_system(%SapSystemReadModel{
         id: id,
         sid: sid,
         health: health,
         application_instances: application_instances,
         database_instances: database_instances,
         database: %{health: database_health},
         database_id: database_id
       }) do
    all_instances = application_instances ++ database_instances

    %{
      id: id,
      sid: sid,
      sapsystem_health: health,
      database_id: database_id,
      database_health: database_health,
      application_cluster_health: compute_cluster_health(application_instances),
      database_cluster_health: compute_cluster_health(database_instances),
      hosts_health: compute_hosts_health(all_instances),
      application_instances: application_instances,
      database_instances: database_instances
    }
  end

  @spec compute_cluster_health(
          [DatabaseInstanceReadModel.t()]
          | [ApplicationInstanceReadModel.t()]
        ) :: Health.t()
  defp compute_cluster_health(instances) do
    cluster_id =
      Enum.find_value(instances, nil, fn
        %{host: %{cluster_id: nil}} -> false
        %{host: %{cluster_id: cluster_id}} -> cluster_id
        _ -> false
      end)

    case cluster_id do
      nil -> HealthEnum.unknown()
      cluster_id -> ClusterReadModel |> Repo.get!(cluster_id) |> Map.get(:health)
    end
  end

  @spec compute_hosts_health([DatabaseInstanceReadModel.t() | ApplicationInstanceReadModel.t()]) ::
          Health.t()
  defp compute_hosts_health(instances) do
    instances
    |> Enum.filter(fn %{host: host} -> host end)
    |> Enum.map(fn %{host: %{health: health}} -> health end)
    |> Enum.filter(& &1)
    |> HealthService.compute_aggregated_health()
  end
end
