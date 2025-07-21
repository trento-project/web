defmodule Trento.SapSystemsTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory
  import Mox

  alias Trento.SapSystems

  alias Trento.SapSystems.Projections.SapSystemReadModel

  alias Trento.SapSystems.Commands.DeregisterApplicationInstance

  alias Trento.Operations.V1.{
    OperationRequested,
    OperationTarget
  }

  alias Google.Protobuf.Value, as: ProtobufValue

  alias Trento.Infrastructure.Operations.AMQP.Publisher, as: OperationsPublisher

  @moduletag :integration

  describe "sap_systems" do
    test "should retrieve all the currently registered existing sap systems and the related instances" do
      %{id: database_id} = insert(:database)

      %SapSystemReadModel{
        id: sap_system_id,
        sid: sid,
        tenant: tenant,
        db_host: db_host,
        database_id: database_id
      } = insert(:sap_system, database_id: database_id)

      insert(:sap_system, deregistered_at: DateTime.utc_now())

      application_instances =
        Enum.sort_by(
          insert_list(5, :application_instance, sap_system_id: sap_system_id),
          &{&1.instance_number, &1.host_id}
        )

      database_instances =
        Enum.sort_by(
          insert_list(5, :database_instance, database_id: database_id),
          &{&1.instance_number, &1.host_id}
        )

      assert [
               %SapSystemReadModel{
                 id: ^sap_system_id,
                 sid: ^sid,
                 tenant: ^tenant,
                 db_host: ^db_host,
                 database_id: ^database_id,
                 application_instances: ^application_instances,
                 database_instances: ^database_instances
               }
             ] = SapSystems.get_all_sap_systems()
    end

    test "should not return a non existent sap system" do
      assert {:error, :not_found} == SapSystems.by_id(Faker.UUID.v4())
    end

    test "should return an existent sap system, whether it is registered or not" do
      %{id: registered_sap_system_id} = insert(:sap_system)

      %{id: deregistered_sap_system_id} =
        insert(:sap_system, deregistered_at: Faker.DateTime.backward(1))

      for sap_system_id <- [registered_sap_system_id, deregistered_sap_system_id] do
        assert {:ok, %SapSystemReadModel{id: ^sap_system_id}} = SapSystems.by_id(sap_system_id)
      end
    end
  end

  describe "get_sap_system_by_id/1" do
    test "should return an existing sap system" do
      %{id: sap_system_id} = insert(:sap_system)

      %SapSystemReadModel{id: ^sap_system_id} = SapSystems.get_sap_system_by_id(sap_system_id)
    end

    test "should return nil if the sap system is not found" do
      assert nil == SapSystems.get_sap_system_by_id(UUID.uuid4())
    end

    test "should return nil if the sap system is deregistered" do
      %{id: sap_system_id} = insert(:sap_system, deregistered_at: DateTime.utc_now())

      assert nil == SapSystems.get_sap_system_by_id(sap_system_id)
    end
  end

  describe "get_application_instances_by_id/1" do
    test "should return empty if no application instances were found" do
      assert [] == SapSystems.get_application_instances_by_id(UUID.uuid4())
    end

    test "should return application instances with the provided id" do
      sap_system_id = UUID.uuid4()
      insert_list(5, :application_instance, sap_system_id: sap_system_id)
      insert_list(5, :application_instance)

      application_instances = SapSystems.get_application_instances_by_id(sap_system_id)

      assert 5 == length(application_instances)
      assert Enum.all?(application_instances, &(&1.sap_system_id == sap_system_id))
    end
  end

  describe "get_application_instances_by_host_id/1" do
    test "should return an empty list if no application instances were found" do
      assert [] == SapSystems.get_application_instances_by_host_id(UUID.uuid4())
    end

    test "should return all the instances with the matching host_id" do
      host_id = UUID.uuid4()
      insert_list(10, :application_instance, host_id: host_id)
      insert_list(10, :application_instance)

      application_instances = SapSystems.get_application_instances_by_host_id(host_id)

      assert 10 == length(application_instances)
      assert Enum.all?(application_instances, &(&1.host_id == host_id))
    end
  end

  describe "deregister_application_instance/4" do
    test "should dispatch an application deregistration command" do
      sap_system_id = Faker.UUID.v4()
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
        fn %DeregisterApplicationInstance{
             sap_system_id: ^sap_system_id,
             host_id: ^host_id,
             instance_number: ^instance_number,
             deregistered_at: ^deregistered_at
           },
           _ ->
          :ok
        end
      )

      assert :ok =
               SapSystems.deregister_application_instance(
                 sap_system_id,
                 host_id,
                 instance_number,
                 Trento.Support.DateService.Mock
               )
    end

    test "should not delete a not absent application instance" do
      %{sap_system_id: sap_system_id, host_id: host_id, instance_number: instance_number} =
        insert(:application_instance, absent_at: nil)

      assert {:error, :instance_present} =
               SapSystems.deregister_application_instance(
                 sap_system_id,
                 host_id,
                 instance_number,
                 Trento.Support.DateService.Mock
               )
    end
  end

  describe "request_instance_operation/4" do
    test "should return error if operation is not found" do
      assert {:error, :operation_not_found} ==
               SapSystems.request_instance_operation(:unknown, UUID.uuid4(), "00", %{})
    end

    scenarios = [
      %{
        operation: :sap_instance_start,
        expected_operator: "sapinstancestart@v1"
      },
      %{
        operation: :sap_instance_stop,
        expected_operator: "sapinstancestop@v1"
      }
    ]

    for %{operation: operation} = scenario <- scenarios do
      @scenario scenario

      test "should request #{operation} operation" do
        %{operation: operation, expected_operator: expected_operator} = @scenario

        %{host_id: host_id, instance_number: instance_number} = insert(:application_instance)

        expect(
          Trento.Infrastructure.Messaging.Adapter.Mock,
          :publish,
          1,
          fn OperationsPublisher,
             "requests",
             %OperationRequested{
               group_id: ^host_id,
               operation_type: ^expected_operator,
               targets: [
                 %OperationTarget{
                   agent_id: ^host_id,
                   arguments: %{
                     "instance_number" => %ProtobufValue{kind: {:string_value, ^instance_number}}
                   }
                 }
               ]
             } ->
            :ok
          end
        )

        assert {:ok, _} =
                 SapSystems.request_instance_operation(operation, host_id, instance_number, %{})
      end

      test "should handle operation #{operation} publish error" do
        %{operation: operation} = @scenario

        expect(
          Trento.Infrastructure.Messaging.Adapter.Mock,
          :publish,
          1,
          fn OperationsPublisher, "requests", _ ->
            {:error, :amqp_error}
          end
        )

        assert {:error, :amqp_error} =
                 SapSystems.request_instance_operation(operation, UUID.uuid4(), "00", %{})
      end
    end
  end

  describe "request_operation/3" do
    test "should return error if operation is not found" do
      assert {:error, :operation_not_found} ==
               SapSystems.request_operation(:unknown, UUID.uuid4(), %{})
    end

    scenarios = [
      %{
        operation: :sap_system_start,
        expected_operator: "sapsystemstart@v1"
      },
      %{
        operation: :sap_system_stop,
        expected_operator: "sapsystemstop@v1"
      }
    ]

    for %{operation: operation} = scenario <- scenarios do
      @scenario scenario

      test "should request #{operation} operation" do
        %{operation: operation, expected_operator: expected_operator} = @scenario

        %{id: sap_system_id} = insert(:sap_system)

        %{id: host_id_1} = insert(:host, heartbeat: :critical)
        %{id: host_id_2} = insert(:host, heartbeat: :passing)
        %{id: host_id_3} = insert(:host, heartbeat: :passing)

        insert(:application_instance, sap_system_id: sap_system_id, host_id: host_id_1)

        insert(:application_instance,
          sap_system_id: sap_system_id,
          host_id: host_id_2,
          absent_at: DateTime.utc_now()
        )

        %{instance_number: instance_number} =
          insert(:application_instance, sap_system_id: sap_system_id, host_id: host_id_3)

        expect(
          Trento.Infrastructure.Messaging.Adapter.Mock,
          :publish,
          1,
          fn OperationsPublisher,
             "requests",
             %OperationRequested{
               group_id: ^sap_system_id,
               operation_type: ^expected_operator,
               targets: [
                 %OperationTarget{
                   agent_id: ^host_id_3,
                   arguments: %{
                     "instance_number" => %ProtobufValue{kind: {:string_value, ^instance_number}}
                   }
                 }
               ]
             } ->
            :ok
          end
        )

        assert {:ok, _} =
                 SapSystems.request_operation(operation, sap_system_id, %{})
      end

      test "should request #{operation} operation with first host if there is no running host" do
        %{operation: operation, expected_operator: expected_operator} = @scenario

        %{id: sap_system_id} = insert(:sap_system)

        %{id: host_id_1} = insert(:host, heartbeat: :critical)
        %{id: host_id_2} = insert(:host, heartbeat: :critical)

        insert(:application_instance, sap_system_id: sap_system_id, host_id: host_id_1)
        insert(:application_instance, sap_system_id: sap_system_id, host_id: host_id_2)

        expect(
          Trento.Infrastructure.Messaging.Adapter.Mock,
          :publish,
          1,
          fn OperationsPublisher,
             "requests",
             %OperationRequested{
               group_id: ^sap_system_id,
               operation_type: ^expected_operator,
               targets: [
                 %OperationTarget{
                   agent_id: _,
                   arguments: %{
                     "instance_number" => %ProtobufValue{kind: {:string_value, _}}
                   }
                 }
               ]
             } ->
            :ok
          end
        )

        assert {:ok, _} =
                 SapSystems.request_operation(operation, sap_system_id, %{})
      end

      test "should handle operation #{operation} publish error" do
        %{operation: operation} = @scenario

        expect(
          Trento.Infrastructure.Messaging.Adapter.Mock,
          :publish,
          1,
          fn OperationsPublisher, "requests", _ ->
            {:error, :amqp_error}
          end
        )

        assert {:error, :amqp_error} =
                 SapSystems.request_operation(operation, UUID.uuid4(), %{})
      end
    end
  end
end
