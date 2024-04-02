defmodule TrentoWeb.V1.HealthOverviewViewTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory

  import Phoenix.View

  require Trento.Enums.Health, as: Health

  describe "renders overview.json" do
    test "should render all the fields" do
      sap_system_id = UUID.uuid4()
      sid = UUID.uuid4()
      tenant = UUID.uuid4()
      app_cluster_id = UUID.uuid4()
      db_cluster_id = UUID.uuid4()

      application_instances =
        build_list(1, :application_instance_without_host,
          sap_system_id: sap_system_id,
          host: build(:host, cluster_id: nil)
        ) ++
          build_list(
            2,
            :application_instance_without_host,
            sap_system_id: sap_system_id,
            host: build(:host, cluster_id: app_cluster_id)
          )

      %{id: database_id} = insert(:database, health: Health.passing())

      database_instances =
        build_list(
          2,
          :database_instance_without_host,
          database_id: database_id,
          host: build(:host, cluster_id: db_cluster_id),
          tenant: tenant
        )

      assert [
               %{
                 id: sap_system_id,
                 sid: sid,
                 sapsystem_health: Health.passing(),
                 database_id: database_id,
                 database_health: Health.passing(),
                 clusters_health: Health.warning(),
                 application_cluster_health: Health.critical(),
                 database_cluster_health: Health.warning(),
                 hosts_health: Health.warning(),
                 cluster_id: db_cluster_id,
                 application_cluster_id: app_cluster_id,
                 database_cluster_id: db_cluster_id,
                 tenant: tenant
               }
             ] ==
               render(TrentoWeb.V1.HealthOverviewView, "overview.json", %{
                 health_infos: [
                   %{
                     id: sap_system_id,
                     sid: sid,
                     sapsystem_health: Health.passing(),
                     application_instances: application_instances,
                     database_id: database_id,
                     database_instances: database_instances,
                     database_health: Health.passing(),
                     application_cluster_health: Health.critical(),
                     database_cluster_health: Health.warning(),
                     hosts_health: Health.warning()
                   }
                 ]
               })
    end

    test "should send empty cluster ids" do
      sap_system_id = UUID.uuid4()

      application_instances =
        build_list(
          2,
          :application_instance_without_host,
          sap_system_id: sap_system_id,
          host: build(:host, cluster_id: nil)
        )

      %{id: database_id} = insert(:database, health: Health.passing())

      database_instances =
        build_list(
          2,
          :database_instance_without_host,
          database_id: database_id,
          host: build(:host, cluster_id: nil),
          tenant: UUID.uuid4()
        )

      assert [
               %{
                 cluster_id: nil,
                 clusters_health: Health.unknown(),
                 application_cluster_id: nil,
                 database_cluster_id: nil,
                 application_cluster_health: Health.unknown(),
                 database_cluster_health: Health.unknown()
               }
             ] =
               render(TrentoWeb.V1.HealthOverviewView, "overview.json", %{
                 health_infos: [
                   %{
                     id: sap_system_id,
                     sid: UUID.uuid4(),
                     sapsystem_health: Health.passing(),
                     application_instances: application_instances,
                     database_id: database_id,
                     database_instances: database_instances,
                     database_health: Health.passing(),
                     application_cluster_health: Health.unknown(),
                     database_cluster_health: Health.unknown(),
                     hosts_health: Health.warning()
                   }
                 ]
               })
    end
  end
end
