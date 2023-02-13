defmodule TrentoWeb.V1.HealthOverviewViewTest do
  use TrentoWeb.ConnCase, async: true

  alias Trento.{
    DatabaseInstanceReadModel,
    HostReadModel
  }

  import Phoenix.View

  test "renders overview.json" do
    sap_system_id = UUID.uuid4()
    sid = UUID.uuid4()
    tenant = UUID.uuid4()
    cluster_id = UUID.uuid4()

    assert [
             %{
               cluster_id: ^cluster_id,
               clusters_health: :critical,
               database_health: :passing,
               database_id: ^sap_system_id,
               hosts_health: :warning,
               id: ^sap_system_id,
               sapsystem_health: :passing,
               sid: ^sid,
               tenant: ^tenant
             }
           ] =
             render(TrentoWeb.V1.HealthOverviewView, "overview.json", %{
               health_infos: [
                 %{
                   id: sap_system_id,
                   sid: sid,
                   sapsystem_health: :passing,
                   database_instances: [
                     %DatabaseInstanceReadModel{
                       host: %HostReadModel{cluster_id: cluster_id},
                       sap_system_id: sap_system_id,
                       tenant: tenant
                     }
                   ],
                   database_health: :passing,
                   clusters_health: :critical,
                   hosts_health: :warning
                 }
               ]
             })
  end
end
