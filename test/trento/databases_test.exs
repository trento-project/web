defmodule Trento.DatabasesTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory
  import Mox

  alias Trento.Databases

  alias Trento.Databases.Projections.DatabaseReadModel

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
          insert_list(5, :database_instance, database_id: database_id),
          & &1.host_id
        )

      assert [
               %DatabaseReadModel{
                 sid: ^sid,
                 database_instances: ^database_instances
               }
             ] = Databases.get_all_databases()
    end

    test "should not return a non existent database" do
      assert {:error, :not_found} == Databases.by_id(Faker.UUID.v4())
    end

    test "should return an existent database, whether it is registered or not" do
      %{id: registered_database_id} = insert(:database)

      %{id: deregistered_database_id} =
        insert(:database, deregistered_at: Faker.DateTime.backward(1))

      for database_id <- [registered_database_id, deregistered_database_id] do
        assert {:ok, %DatabaseReadModel{id: ^database_id}} = Databases.by_id(database_id)
      end
    end
  end

  describe "get_database_instances_by_id/1" do
    test "should return empty if no database instances were found" do
      assert [] == Databases.get_database_instances_by_id(UUID.uuid4())
    end

    test "should return database instances with the provided id" do
      database_id = UUID.uuid4()
      insert_list(5, :database_instance, database_id: database_id)
      insert_list(5, :database_instance)

      database_instances = Databases.get_database_instances_by_id(database_id)

      assert 5 == length(database_instances)
      assert Enum.all?(database_instances, &(&1.database_id == database_id))
    end
  end

  describe "get_database_instances_by_host_id/1" do
    test "should return empty if no database instances were found" do
      assert [] == Databases.get_database_instances_by_host_id(UUID.uuid4())
    end

    test "should return all the instances with the matching host_id" do
      host_id = UUID.uuid4()
      insert_list(10, :database_instance, host_id: host_id)
      insert_list(10, :database_instance)

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
           },
           _ ->
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
      %{database_id: database_id, host_id: host_id, instance_number: instance_number} =
        insert(:database_instance, absent_at: nil)

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
