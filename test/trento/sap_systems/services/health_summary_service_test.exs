# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.SapSystems.Services.HealthSummaryServiceTest do
  @moduledoc false

  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.SapSystems.Services.HealthSummaryService
  require Trento.Enums.Health, as: Health
  require Trento.Clusters.Enums.ClusterType, as: ClusterType
  require Trento.SapSystems.Enums.Status, as: Status

  alias Trento.Clusters.Projections.ClusterReadModel
  alias Trento.Databases.Projections.DatabaseReadModel
  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.SapSystems.Projections.SapSystemReadModel

  describe "SAP Systems Health Summary" do
    test "should return an empty summary" do
      assert [] = HealthSummaryService.get_health_summary()
    end

    test "should determine health summary for a SAP System" do
      app_cluster_stale_at = DateTime.utc_now()

      %ClusterReadModel{id: db_cluster_id} =
        insert(:cluster, type: ClusterType.hana_scale_up(), health: Health.passing())

      %ClusterReadModel{id: app_cluster_id} =
        insert(
          :cluster,
          type: ClusterType.ascs_ers(),
          health: Health.warning(),
          stale_at: app_cluster_stale_at
        )

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

      insert(
        :database_instance,
        database_id: database_id,
        instance_number: "00",
        host_id: db_host_id,
        status: Status.yellow(),
        host: db_host
      )

      insert(
        :database_instance,
        database_id: database_id,
        instance_number: "01",
        host_id: db_host_id_2,
        status: Status.green(),
        host: db_host_2
      )

      insert(
        :application_instance,
        sap_system_id: sap_system_id,
        instance_number: "10",
        sid: sid,
        host_id: app_host_id,
        status: Status.green(),
        host: app_host
      )

      insert(
        :application_instance,
        sap_system_id: sap_system_id,
        instance_number: "11",
        sid: sid,
        host_id: app_host_id_2,
        status: Status.red(),
        host: app_host_2
      )

      assert [
               %{
                 id: sap_system_id,
                 sid: sid,
                 sapsystem_health: Health.critical(),
                 application_health: Health.critical(),
                 application_stale_at: nil,
                 application_cluster_id: app_cluster_id,
                 application_cluster_health: Health.warning(),
                 application_cluster_stale_at: app_cluster_stale_at,
                 database_id: database_id,
                 database_sid: database_sid,
                 database_health: database_health,
                 database_stale_at: nil,
                 database_cluster_id: db_cluster_id,
                 database_cluster_health: Health.passing(),
                 database_cluster_stale_at: nil,
                 hosts_health: Health.unknown(),
                 hosts_stale_at: nil
               }
             ] == HealthSummaryService.get_health_summary()
    end

    test "should set as nil the database and application clusters health when those clusters do not exist or are deregistered" do
      %ClusterReadModel{id: deregistered_cluster_id} =
        insert(:cluster, deregistered_at: DateTime.utc_now())

      %HostReadModel{id: db_host_id} =
        db_host = insert(:host, cluster_id: nil, health: Health.passing())

      %HostReadModel{id: app_host_id} =
        app_host = insert(:host, cluster_id: deregistered_cluster_id, health: Health.passing())

      %DatabaseReadModel{id: database_id, health: database_health, sid: database_sid} =
        insert(:database)

      %SapSystemReadModel{
        id: sap_system_id,
        sid: sid
      } = insert(:sap_system, health: Health.critical(), database_id: database_id)

      insert(:sap_system, deregistered_at: DateTime.utc_now())

      insert(
        :database_instance,
        database_id: database_id,
        instance_number: "00",
        host_id: db_host_id,
        status: Status.yellow(),
        host: db_host
      )

      insert(
        :application_instance,
        sap_system_id: sap_system_id,
        instance_number: "10",
        sid: sid,
        host_id: app_host_id,
        status: Status.green(),
        host: app_host
      )

      assert [
               %{
                 id: sap_system_id,
                 sid: sid,
                 sapsystem_health: Health.critical(),
                 application_health: Health.passing(),
                 application_stale_at: nil,
                 application_cluster_id: nil,
                 application_cluster_health: nil,
                 application_cluster_stale_at: nil,
                 database_id: database_id,
                 database_sid: database_sid,
                 database_health: database_health,
                 database_stale_at: nil,
                 database_cluster_id: nil,
                 database_cluster_health: nil,
                 database_cluster_stale_at: nil,
                 hosts_health: Health.passing(),
                 hosts_stale_at: nil
               }
             ] == HealthSummaryService.get_health_summary()
    end

    test "should return the oldest stale_at of the application instances and the hosts" do
      now = DateTime.utc_now()
      oldest_stale_at = DateTime.add(now, -30, :minute)
      newest_stale_at = DateTime.add(now, -5, :minute)
      database_stale_at = DateTime.add(now, -15, :minute)

      oldest_host_stale_at = DateTime.add(now, -45, :minute)
      newest_host_stale_at = DateTime.add(now, -20, :minute)

      %HostReadModel{id: db_host_id} =
        db_host =
        insert(
          :host,
          cluster_id: nil,
          health: Health.passing(),
          stale_at: newest_host_stale_at
        )

      %HostReadModel{id: app_host_id} =
        app_host =
        insert(
          :host,
          cluster_id: nil,
          health: Health.passing(),
          stale_at: oldest_host_stale_at
        )

      %DatabaseReadModel{id: database_id} = insert(:database, stale_at: database_stale_at)

      %SapSystemReadModel{id: sap_system_id, sid: sid} =
        insert(:sap_system, health: Health.passing(), database_id: database_id)

      insert(
        :database_instance,
        database_id: database_id,
        instance_number: "00",
        host_id: db_host_id,
        host: db_host
      )

      for {instance_number, stale_at} <- [
            {"10", newest_stale_at},
            {"11", nil},
            {"12", oldest_stale_at}
          ] do
        insert(
          :application_instance,
          sap_system_id: sap_system_id,
          instance_number: instance_number,
          sid: sid,
          host_id: app_host_id,
          host: app_host,
          stale_at: stale_at
        )
      end

      assert [
               %{
                 application_stale_at: ^oldest_stale_at,
                 database_stale_at: ^database_stale_at,
                 hosts_stale_at: ^oldest_host_stale_at
               }
             ] = HealthSummaryService.get_health_summary()
    end
  end
end
