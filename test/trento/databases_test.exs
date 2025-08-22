defmodule Trento.DatabasesTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory
  import Mox

  alias Trento.Databases

  alias Trento.Databases.Projections.DatabaseReadModel

  alias Trento.Databases.Commands.DeregisterDatabaseInstance

  alias Trento.Operations.V1.{
    OperationRequested,
    OperationTarget
  }

  alias Google.Protobuf.Value, as: ProtobufValue

  alias Trento.Infrastructure.Operations.AMQP.Publisher, as: OperationsPublisher

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

  describe "get_database_by_id/1" do
    test "should return an existing database" do
      %{id: database_id} = insert(:database)

      %DatabaseReadModel{id: ^database_id} = Databases.get_database_by_id(database_id)
    end

    test "should return nil if the database is not found" do
      assert nil == Databases.get_database_by_id(UUID.uuid4())
    end

    test "should return nil if the database is deregistered" do
      %{id: database_id} = insert(:database, deregistered_at: DateTime.utc_now())

      assert nil == Databases.get_database_by_id(database_id)
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

  describe "request_operation/3" do
    test "should return error if operation is not found" do
      assert {:error, :operation_not_found} ==
               Databases.request_operation(:unknown, UUID.uuid4(), %{})
    end

    scenarios = [
      %{
        name: "database_start",
        operation: :database_start,
        expected_operator: "databasestart@v1",
        params: %{},
        expected_arguments: %{}
      },
      %{
        name: "database_start with params",
        operation: :database_start,
        expected_operator: "databasestart@v1",
        params: %{
          site: "Trento",
          timeout: 5_000
        },
        expected_arguments: %{
          "site" => %ProtobufValue{kind: {:string_value, "Trento"}},
          "timeout" => %ProtobufValue{kind: {:number_value, 5_000}}
        }
      },
      %{
        name: "database_stop",
        operation: :database_stop,
        expected_operator: "databasestop@v1",
        params: %{},
        expected_arguments: %{}
      }
    ]

    for %{name: name} = scenario <- scenarios do
      @scenario scenario

      test "should request #{name} operation" do
        %{
          operation: operation,
          expected_operator: expected_operator,
          params: params,
          expected_arguments: expected_arguments
        } = @scenario

        %{id: database_id} = insert(:database)

        %{id: host_id_1} = insert(:host, heartbeat: :critical)
        %{id: host_id_2} = insert(:host, heartbeat: :passing)
        %{id: host_id_3} = insert(:host, heartbeat: :passing)

        insert(:database_instance, database_id: database_id, host_id: host_id_1)

        insert(:database_instance,
          database_id: database_id,
          host_id: host_id_2,
          absent_at: DateTime.utc_now()
        )

        %{instance_number: instance_number} =
          insert(:database_instance,
            database_id: database_id,
            host_id: host_id_3,
            system_replication_site: Map.get(params, :site, nil)
          )

        expected_args =
          Map.merge(
            %{
              "instance_number" => %ProtobufValue{kind: {:string_value, instance_number}}
            },
            expected_arguments
          )

        expect(
          Trento.Infrastructure.Messaging.Adapter.Mock,
          :publish,
          1,
          fn OperationsPublisher,
             "requests",
             %OperationRequested{
               group_id: ^database_id,
               operation_type: ^expected_operator,
               targets: [
                 %OperationTarget{
                   agent_id: ^host_id_3,
                   arguments: ^expected_args
                 }
               ]
             } ->
            :ok
          end
        )

        assert {:ok, _} =
                 Databases.request_operation(operation, database_id, params)
      end

      test "should request #{name} operation with first host if there is no running host" do
        %{
          operation: operation,
          expected_operator: expected_operator,
          params: params
        } = @scenario

        %{id: database_id} = insert(:database)

        %{id: host_id_1} = insert(:host, heartbeat: :critical)
        %{id: host_id_2} = insert(:host, heartbeat: :critical)

        insert(:database_instance,
          database_id: database_id,
          host_id: host_id_1,
          system_replication_site: Map.get(params, :site, nil)
        )

        insert(:database_instance, database_id: database_id, host_id: host_id_2)

        expect(
          Trento.Infrastructure.Messaging.Adapter.Mock,
          :publish,
          1,
          fn OperationsPublisher,
             "requests",
             %OperationRequested{
               group_id: ^database_id,
               operation_type: ^expected_operator,
               targets: [
                 %OperationTarget{
                   agent_id: _,
                   arguments: _
                 }
               ]
             } ->
            :ok
          end
        )

        assert {:ok, _} =
                 Databases.request_operation(operation, database_id, params)
      end

      test "should handle operation #{name} publish error" do
        %{operation: operation, params: params} = @scenario

        expect(
          Trento.Infrastructure.Messaging.Adapter.Mock,
          :publish,
          1,
          fn OperationsPublisher, "requests", _ ->
            {:error, :amqp_error}
          end
        )

        assert {:error, :amqp_error} =
                 Databases.request_operation(operation, UUID.uuid4(), params)
      end
    end

    test "should request operation filtering by site" do
      filtered_site = Faker.Cat.name()
      %{id: database_id} = insert(:database)

      %{id: host_id_1} = insert(:host, heartbeat: :passing)
      %{id: host_id_2} = insert(:host, heartbeat: :passing)

      insert(:database_instance,
        database_id: database_id,
        host_id: host_id_1,
        system_replication_site: nil
      )

      insert(:database_instance,
        database_id: database_id,
        host_id: host_id_2,
        system_replication_site: filtered_site
      )

      expect(
        Trento.Infrastructure.Messaging.Adapter.Mock,
        :publish,
        1,
        fn OperationsPublisher,
           "requests",
           %OperationRequested{
             group_id: ^database_id,
             targets: [
               %OperationTarget{
                 agent_id: ^host_id_2,
                 arguments: _
               }
             ]
           } ->
          :ok
        end
      )

      assert {:ok, _} =
               Databases.request_operation(:database_start, database_id, %{site: filtered_site})
    end
  end
end
