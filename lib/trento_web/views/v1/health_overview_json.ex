defmodule TrentoWeb.V1.HealthOverviewJSON do
  alias Trento.Databases.Projections.DatabaseInstanceReadModel
  alias Trento.SapSystems.Projections.ApplicationInstanceReadModel

  def overview(%{health_infos: health_infos}) do
    Enum.map(health_infos, &health_summary/1)
  end

  def health_summary(%{
        id: id,
        sid: sid,
        sapsystem_health: sapsystem_health,
        application_instances: application_instances,
        database_id: database_id,
        database_instances: database_instances,
        database_health: database_health,
        application_cluster_health: application_cluster_health,
        database_cluster_health: database_cluster_health,
        hosts_health: hosts_health,
        database_sid: database_sid
      }) do
    %{
      id: id,
      sid: sid,
      sapsystem_health: sapsystem_health,
      database_id: database_id,
      database_health: database_health,
      # deprecated field
      clusters_health: database_cluster_health,
      application_cluster_health: application_cluster_health,
      database_cluster_health: database_cluster_health,
      hosts_health: hosts_health,
      # deprecated field
      cluster_id: extract_cluster_id(database_instances),
      application_cluster_id: extract_cluster_id(application_instances),
      database_cluster_id: extract_cluster_id(database_instances),
      # deprecated field
      tenant: database_sid,
      database_sid: database_sid
    }
  end

  @spec extract_cluster_id([ApplicationInstanceReadModel.t()] | [DatabaseInstanceReadModel.t()]) ::
          String.t() | nil
  defp extract_cluster_id([]), do: nil

  defp extract_cluster_id([%DatabaseInstanceReadModel{host: %{cluster_id: cluster_id}} | _]),
    do: cluster_id

  defp extract_cluster_id(application_instances) do
    Enum.find_value(application_instances, nil, fn
      %{host: %{cluster_id: nil}} -> false
      %{host: %{cluster_id: cluster_id}} -> cluster_id
      _ -> false
    end)
  end
end
