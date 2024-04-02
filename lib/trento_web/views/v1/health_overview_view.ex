defmodule TrentoWeb.V1.HealthOverviewView do
  use TrentoWeb, :view

  alias Trento.Databases.Projections.DatabaseInstanceReadModel
  alias Trento.SapSystems.Projections.ApplicationInstanceReadModel

  def render("overview.json", %{health_infos: health_infos}) do
    render_many(health_infos, __MODULE__, "health_summary.json", as: :summary)
  end

  def render("health_summary.json", %{
        summary: %{
          id: id,
          sid: sid,
          sapsystem_health: sapsystem_health,
          application_instances: application_instances,
          database_id: database_id,
          database_instances: database_instances,
          database_health: database_health,
          application_cluster_health: application_cluster_health,
          database_cluster_health: database_cluster_health,
          hosts_health: hosts_health
        }
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
      tenant: extract_tenant(database_instances)
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

  @spec extract_tenant([DatabaseInstanceReadModel.t()]) :: String.t() | nil
  defp extract_tenant([]), do: nil

  defp extract_tenant([%DatabaseInstanceReadModel{tenant: tenant} | _]),
    do: tenant
end
