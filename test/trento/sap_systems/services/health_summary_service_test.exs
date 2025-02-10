defmodule Trento.SapSystems.Services.HealthSummaryServiceTest do
  @moduledoc false

  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.SapSystems.Services.HealthSummaryService
  require Trento.Enums.Health, as: Health
  require Trento.Clusters.Enums.ClusterType, as: ClusterType

  alias Trento.Clusters.Projections.ClusterReadModel
  alias Trento.Databases.Projections.DatabaseReadModel
  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.SapSystems.Projections.SapSystemReadModel

  describe "SAP Systems Health Summary" do
    test "should return an empty summary" do
      assert [] = HealthSummaryService.get_health_summary()
    end

    test "should raise an exception when a cluster couldn't be loaded" do
      %HostReadModel{id: a_host_id} = insert(:host, cluster_id: Faker.UUID.v4())

      %DatabaseReadModel{id: database_id} = insert(:database)

      %SapSystemReadModel{
        id: sap_system_id,
        sid: sid
      } = insert(:sap_system, database_id: database_id)

      insert(
        :database_instance,
        database_id: database_id,
        host_id: a_host_id
      )

      insert(
        :application_instance,
        sap_system_id: sap_system_id,
        sid: sid,
        host_id: a_host_id
      )

      assert_raise Ecto.NoResultsError, fn ->
        HealthSummaryService.get_health_summary()
      end
    end

    test "should determine health summary for a SAP System" do
      %ClusterReadModel{id: db_cluster_id} =
        insert(:cluster, type: ClusterType.hana_scale_up(), health: Health.passing())

      %ClusterReadModel{id: app_cluster_id} =
        insert(:cluster, type: ClusterType.ascs_ers(), health: Health.warning())

      %HostReadModel{id: db_host_id} =
        db_host = insert(:host, cluster_id: db_cluster_id, heartbeat: Health.unknown())

      %HostReadModel{id: db_host_id_2} =
        db_host_2 = insert(:host, cluster_id: nil, heartbeat: Health.passing())

      %HostReadModel{id: app_host_id} =
        app_host = insert(:host, cluster_id: app_cluster_id, heartbeat: Health.passing())

      %HostReadModel{id: app_host_id_2} =
        app_host_2 = insert(:host, cluster_id: nil, heartbeat: Health.critical())

      %DatabaseReadModel{id: database_id, health: database_health, sid: database_sid} =
        insert(:database)

      %SapSystemReadModel{
        id: sap_system_id,
        sid: sid
      } = insert(:sap_system, health: Health.critical(), database_id: database_id)

      insert(:sap_system, deregistered_at: DateTime.utc_now())

      database_instances = [
        insert(
          :database_instance,
          database_id: database_id,
          instance_number: "00",
          host_id: db_host_id,
          health: Health.warning(),
          host: db_host
        ),
        insert(
          :database_instance,
          database_id: database_id,
          instance_number: "01",
          host_id: db_host_id_2,
          health: Health.passing(),
          host: db_host_2
        )
      ]

      application_instances = [
        insert(
          :application_instance,
          sap_system_id: sap_system_id,
          instance_number: "10",
          sid: sid,
          host_id: app_host_id,
          health: Health.passing(),
          host: app_host
        ),
        insert(
          :application_instance,
          sap_system_id: sap_system_id,
          instance_number: "11",
          sid: sid,
          host_id: app_host_id_2,
          health: Health.critical(),
          host: app_host_2
        )
      ]

      assert [
               %{
                 id: sap_system_id,
                 sid: sid,
                 sapsystem_health: Health.critical(),
                 database_health: database_health,
                 database_cluster_health: Health.passing(),
                 application_cluster_health: Health.warning(),
                 hosts_health: Health.unknown(),
                 database_id: database_id,
                 database_instances: database_instances,
                 application_instances: application_instances,
                 database_sid: database_sid
               }
             ] == HealthSummaryService.get_health_summary()
    end

    test "should set as unknown the clusters health when they are not available" do
      %HostReadModel{id: db_host_id} =
        db_host = insert(:host, cluster_id: nil, health: Health.passing())

      %HostReadModel{id: app_host_id} =
        app_host = insert(:host, cluster_id: nil, health: Health.passing())

      %DatabaseReadModel{id: database_id, health: database_health, sid: database_sid} =
        insert(:database)

      %SapSystemReadModel{
        id: sap_system_id,
        sid: sid
      } = insert(:sap_system, health: Health.critical(), database_id: database_id)

      insert(:sap_system, deregistered_at: DateTime.utc_now())

      database_instances =
        insert_list(
          1,
          :database_instance,
          database_id: database_id,
          instance_number: "00",
          host_id: db_host_id,
          health: Health.warning(),
          host: db_host
        )

      application_instances =
        insert_list(
          1,
          :application_instance,
          sap_system_id: sap_system_id,
          instance_number: "10",
          sid: sid,
          host_id: app_host_id,
          health: Health.passing(),
          host: app_host
        )

      assert [
               %{
                 id: sap_system_id,
                 sid: sid,
                 sapsystem_health: Health.critical(),
                 database_health: database_health,
                 database_cluster_health: Health.unknown(),
                 database_id: database_id,
                 application_cluster_health: Health.unknown(),
                 hosts_health: Health.passing(),
                 database_instances: database_instances,
                 application_instances: application_instances,
                 database_sid: database_sid
               }
             ] == HealthSummaryService.get_health_summary()
    end
  end
end
