defmodule Trento.SapSystemsTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.SapSystems

  alias Trento.{
    DatabaseReadModel,
    SapSystemReadModel
  }

  @moduletag :integration

  describe "sap_systems" do
    test "should retrieve all the currently registered existing sap systems and the related instances" do
      %SapSystemReadModel{
        id: sap_system_id,
        sid: sid,
        tenant: tenant,
        db_host: db_host
      } = insert(:sap_system)

      insert(:sap_system, deregistered_at: DateTime.utc_now())

      application_instances =
        Enum.sort_by(
          insert_list(5, :application_instance_without_host, sap_system_id: sap_system_id),
          &{&1.instance_number, &1.host_id}
        )

      database_instances =
        Enum.sort_by(
          insert_list(5, :database_instance_without_host, sap_system_id: sap_system_id),
          &{&1.instance_number, &1.host_id}
        )

      assert [
               %SapSystemReadModel{
                 id: ^sap_system_id,
                 sid: ^sid,
                 tenant: ^tenant,
                 db_host: ^db_host,
                 application_instances: ^application_instances,
                 database_instances: ^database_instances
               }
             ] = SapSystems.get_all_sap_systems()
    end

    test "should retrieve all the existing databases and the related instances" do
      %DatabaseReadModel{
        id: sap_system_id,
        sid: sid
      } = insert(:database)

      database_instances =
        Enum.sort_by(
          insert_list(5, :database_instance_without_host, sap_system_id: sap_system_id),
          & &1.host_id
        )

      assert [
               %DatabaseReadModel{
                 sid: ^sid,
                 database_instances: ^database_instances
               }
             ] = SapSystems.get_all_databases()
    end
  end
end
