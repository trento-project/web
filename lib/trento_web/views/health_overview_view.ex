defmodule TrentoWeb.HealthOverviewView do
  use TrentoWeb, :view

  alias Trento.DatabaseInstanceReadModel

  def render("overview.json", %{health_infos: health_infos}) do
    render_many(health_infos, __MODULE__, "health_summary.json", as: :summary)
  end

  def render("health_summary.json", %{
        summary: %{
          id: id,
          sid: sid,
          sapsystem_health: sapsystem_health,
          database_instances: database_instances,
          database_health: database_health,
          clusters_health: clusters_health,
          hosts_health: hosts_health,
          tenant: tenant
        }
      }) do
    %{
      id: id,
      sid: sid,
      sapsystem_health: sapsystem_health,
      database_health: database_health,
      clusters_health: clusters_health,
      hosts_health: hosts_health,
      cluster_id: extract_cluster_id(database_instances),
      database_id: extract_database_id(database_instances),
      tenant: tenant
    }
  end

  @spec extract_database_id([DatabaseInstanceReadModel.t()]) :: String.t()
  defp extract_database_id([]), do: nil

  defp extract_database_id([%DatabaseInstanceReadModel{sap_system_id: sap_system_id} | _]),
    do: sap_system_id

  @spec extract_cluster_id([DatabaseInstanceReadModel.t()]) :: String.t()
  defp extract_cluster_id([]), do: nil

  defp extract_cluster_id([%DatabaseInstanceReadModel{host: %{cluster_id: cluster_id}} | _]),
    do: cluster_id
end
