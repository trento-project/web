defmodule Trento.HealthSummaryServiceTest do
  @moduledoc false

  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.Application.UseCases.SapSystems.HealthSummaryDto
  alias Trento.SapSystems.HealthSummaryService

  alias Trento.{
    HostReadModel,
    SapSystemReadModel
  }

  describe "SAP Systems Health Summary" do
    test "should return an empty summary" do
      assert [] = HealthSummaryService.get_health_summary()
    end

    test "should raise an exception when a cluster couldn't be loaded" do
      %HostReadModel{id: a_host_id} = host_projection(cluster_id: Faker.UUID.v4())

      %SapSystemReadModel{
        id: sap_system_id,
        sid: sid
      } = sap_system_projection()

      database_instance_projection_without_host(
        sap_system_id: sap_system_id,
        sid: "HDD",
        host_id: a_host_id
      )

      application_instance_projection_without_host(
        sap_system_id: sap_system_id,
        sid: sid,
        host_id: a_host_id
      )

      assert_raise Ecto.NoResultsError, fn ->
        HealthSummaryService.get_health_summary()
      end
    end

    test "should determine health summary for a SAP System" do
      %{
        sap_system_id: sap_system_id,
        sid: sid
      } = sap_system_with_cluster_and_hosts()

      assert [
               %HealthSummaryDto{
                 id: ^sap_system_id,
                 sid: ^sid,
                 sapsystem_health: :passing,
                 database_health: :critical,
                 clusters_health: :warning,
                 hosts_health: :unknown
               }
             ] = HealthSummaryService.get_health_summary()
    end
  end
end
