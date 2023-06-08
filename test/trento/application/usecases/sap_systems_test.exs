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

  describe "get_application_instances_by_host_id/1" do
    test "should return an empty list if no application instances were found" do
      assert [] == SapSystems.get_application_instances_by_host_id(UUID.uuid4())
    end

    test "should return all the instances with the matching host_id" do
      host_id = UUID.uuid4()
      insert_list(10, :application_instance_without_host, host_id: host_id)
      insert_list(10, :application_instance_without_host)

      application_instances = SapSystems.get_application_instances_by_host_id(host_id)

      assert 10 == length(application_instances)
      assert Enum.all?(application_instances, &(&1.host_id == host_id))
    end
  end

  describe "get_database_instances_by_host_id/1" do
    test "should return empty if no database instances were found" do
      assert [] == SapSystems.get_application_instances_by_host_id(UUID.uuid4())
    end

    test "should return all the instances with the matching host_id" do
      host_id = UUID.uuid4()
      insert_list(10, :database_instance_without_host, host_id: host_id)
      insert_list(10, :database_instance_without_host)

      database_instances = SapSystems.get_database_instances_by_host_id(host_id)

      assert 10 == length(database_instances)
      assert Enum.all?(database_instances, &(&1.host_id == host_id))
    end
  end
end
