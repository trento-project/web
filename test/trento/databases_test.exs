defmodule Trento.DatabasesTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory
  import Mox

  alias Trento.Databases

  alias Trento.SapSystems.Projections.DatabaseReadModel

  alias Trento.Databases.Commands.DeregisterDatabaseInstance

  @moduletag :integration

  describe "databases" do
    test "should retrieve all the currently registered existing databases and the related instances" do
      %DatabaseReadModel{
        id: database_id,
        sid: sid
      } = insert(:database)

      insert(:database, deregistered_at: DateTime.utc_now())

      database_instances =
        Enum.sort_by(
          insert_list(5, :database_instance_without_host, sap_system_id: database_id),
          & &1.host_id
        )

      assert [
               %DatabaseReadModel{
                 sid: ^sid,
                 database_instances: ^database_instances
               }
             ] = Databases.get_all_databases()
    end
  end

  describe "get_database_instances_by_host_id/1" do
    test "should return empty if no database instances were found" do
      assert [] == Databases.get_database_instances_by_host_id(UUID.uuid4())
    end

    test "should return all the instances with the matching host_id" do
      host_id = UUID.uuid4()
      insert_list(10, :database_instance_without_host, host_id: host_id)
      insert_list(10, :database_instance_without_host)

      database_instances = Databases.get_database_instances_by_host_id(host_id)

      assert 10 == length(database_instances)
      assert Enum.all?(database_instances, &(&1.host_id == host_id))
    end
  end

  describe "deregister_database_instance/4" do
    test "should dispatch an database deregistration command" do
      database_id = Faker.UUID.v4()
      host_id = Faker.UUID.v4()
      instance_number = "00"

      deregistered_at = DateTime.utc_now()

      expect(
        Trento.Support.DateService.Mock,
        :utc_now,
        fn -> deregistered_at end
      )

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn %DeregisterDatabaseInstance{
             database_id: ^database_id,
             host_id: ^host_id,
             instance_number: ^instance_number,
             deregistered_at: ^deregistered_at
           } ->
          :ok
        end
      )

      assert :ok =
               Databases.deregister_database_instance(
                 database_id,
                 host_id,
                 instance_number,
                 Trento.Support.DateService.Mock
               )
    end

    test "should not delete a present database instance" do
      %{sap_system_id: database_id, host_id: host_id, instance_number: instance_number} =
        insert(:database_instance_without_host, absent_at: nil)

      assert {:error, :instance_present} =
               Databases.deregister_database_instance(
                 database_id,
                 host_id,
                 instance_number,
                 Trento.Support.DateService.Mock
               )
    end
  end
end
