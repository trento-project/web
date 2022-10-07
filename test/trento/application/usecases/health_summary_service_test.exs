defmodule Trento.HealthSummaryServiceTest do
  @moduledoc false

  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.Application.UseCases.SapSystems.HealthSummaryDto
  alias Trento.SapSystems.HealthSummaryService
  require Trento.Domain.Enums.Health, as: Health
  require Trento.Domain.Enums.ClusterType, as: ClusterType

  alias Trento.{
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
      %Trento.ClusterReadModel{id: cluster_id} =
        insert(:cluster, type: ClusterType.hana_scale_up(), health: Health.passing())

      %Trento.HostReadModel{id: host_1_id} =
        insert(:host, cluster_id: cluster_id, heartbeat: :unknown)

      %Trento.SapSystemReadModel{
        id: sap_system_id,
        sid: sid
      } = insert(:sap_system, health: Health.critical())

      insert(
        :database_instance_without_host,
        sap_system_id: sap_system_id,
        sid: "HDD",
        host_id: host_1_id,
        health: Health.warning()
      )

      insert(
        :application_instance_without_host,
        sap_system_id: sap_system_id,
        sid: sid,
        host_id: host_1_id,
        health: Health.critical()
      )

      assert [
               %HealthSummaryDto{
                 id: ^sap_system_id,
                 sid: ^sid,
                 sapsystem_health: :critical,
                 database_health: :warning,
                 clusters_health: :passing,
                 hosts_health: :unknown,
                 database_id: ^sap_system_id,
                 cluster_id: ^cluster_id
               }
             ] = HealthSummaryService.get_health_summary()
    end
  end
end
