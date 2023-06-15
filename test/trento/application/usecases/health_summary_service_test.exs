defmodule Trento.HealthSummaryServiceTest do
  @moduledoc false

  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.SapSystems.HealthSummaryService
  require Trento.Domain.Enums.Health, as: Health
  require Trento.Domain.Enums.ClusterType, as: ClusterType

  alias Trento.{
    ClusterReadModel,
    HostReadModel,
    SapSystemReadModel
  }

  describe "SAP Systems Health Summary" do
    test "should return an empty summary" do
      assert [] = HealthSummaryService.get_health_summary()
    end

    test "should raise an exception when a cluster couldn't be loaded" do
      %HostReadModel{id: a_host_id} = insert(:host, cluster_id: Faker.UUID.v4())

      %SapSystemReadModel{
        id: sap_system_id,
        sid: sid
      } = insert(:sap_system)

      insert(
        :database_instance_without_host,
        sap_system_id: sap_system_id,
        sid: "HDD",
        host_id: a_host_id
      )

      insert(
        :application_instance_without_host,
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

      %SapSystemReadModel{
        id: sap_system_id,
        sid: sid
      } = insert(:sap_system, health: Health.critical())

      insert(:sap_system, deregistered_at: DateTime.utc_now())

      database_instances = [
        insert(
          :database_instance,
          sap_system_id: sap_system_id,
          instance_number: "00",
          sid: "HDD",
          host_id: db_host_id,
          health: Health.warning(),
          host: db_host
        ),
        insert(
          :database_instance,
          sap_system_id: sap_system_id,
          instance_number: "01",
          sid: "HDD",
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
                 database_health: Health.warning(),
                 database_cluster_health: Health.passing(),
                 application_cluster_health: Health.warning(),
                 hosts_health: Health.unknown(),
                 database_instances: database_instances,
                 application_instances: application_instances
               }
             ] == HealthSummaryService.get_health_summary()
    end
  end
end
