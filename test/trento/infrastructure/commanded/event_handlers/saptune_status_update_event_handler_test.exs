defmodule Trento.Infrastructure.Commanded.EventHandlers.SaptuneStatusUpdateEventHandlerTest do
  use Trento.DataCase

  import Mox
  import Trento.Factory

  alias Trento.Hosts.Commands.UpdateSaptuneStatus
  alias Trento.Infrastructure.Commanded.EventHandlers.SaptuneStatusUpdateEventHandler

  setup [:set_mox_from_context, :verify_on_exit!]

  describe "instance registration" do
    test "should not dispatch the update command if the host is not registered" do
      events = [
        build(:database_instance_registered_event),
        build(:application_instance_registered_event)
      ]

      for event <- events do
        expect(Trento.Commanded.Mock, :dispatch, 0, fn _ -> :ok end)

        assert :ok == SaptuneStatusUpdateEventHandler.handle(event, %{})
      end
    end

    test "should update saptune status when saptune is not installed" do
      %{id: host_id} = insert(:host, saptune_status: nil)

      events = [
        build(:database_instance_registered_event, host_id: host_id),
        build(:application_instance_registered_event, host_id: host_id)
      ]

      for event <- events do
        expect(Trento.Commanded.Mock, :dispatch, fn %UpdateSaptuneStatus{
                                                      host_id: ^host_id,
                                                      package_version: nil,
                                                      saptune_installed: false,
                                                      sap_running: true,
                                                      status: nil
                                                    } ->
          :ok
        end)

        assert :ok == SaptuneStatusUpdateEventHandler.handle(event, %{})
      end
    end

    test "should update saptune status when saptune is installed" do
      %{package_version: version} = saptune_status = build(:saptune_status)
      %{id: host_id} = insert(:host, saptune_status: saptune_status)
      saptune_as_map = Map.from_struct(saptune_status)

      events = [
        build(:database_instance_registered_event, host_id: host_id),
        build(:application_instance_registered_event, host_id: host_id)
      ]

      for event <- events do
        expect(Trento.Commanded.Mock, :dispatch, fn %UpdateSaptuneStatus{
                                                      host_id: ^host_id,
                                                      package_version: ^version,
                                                      saptune_installed: true,
                                                      sap_running: true,
                                                      status: ^saptune_as_map
                                                    } ->
          :ok
        end)

        assert :ok == SaptuneStatusUpdateEventHandler.handle(event, %{})
      end
    end
  end

  describe "instance deregistration" do
    test "should update saptune when no SAP instances are running" do
      %{id: host_id} = insert(:host)
      %{instance_number: inst_number} = insert(:database_instance, host_id: host_id)

      events = [
        build(:database_instance_deregistered_event,
          host_id: host_id,
          instance_number: inst_number
        ),
        build(:application_instance_deregistered_event,
          host_id: host_id,
          instance_number: inst_number
        )
      ]

      for event <- events do
        expect(Trento.Commanded.Mock, :dispatch, fn %UpdateSaptuneStatus{
                                                      host_id: ^host_id,
                                                      package_version: nil,
                                                      saptune_installed: false,
                                                      sap_running: false,
                                                      status: nil
                                                    } ->
          :ok
        end)

        assert :ok == SaptuneStatusUpdateEventHandler.handle(event, %{})
      end
    end

    test "should update saptune when SAP instances are running" do
      %{id: host_id} = insert(:host)
      inst_number = "10"
      insert(:database_instance, host_id: host_id, instance_number: inst_number)
      insert(:database_instance, host_id: host_id)
      insert(:application_instance, host_id: host_id)

      events = [
        build(:database_instance_deregistered_event,
          host_id: host_id,
          instance_number: inst_number
        ),
        build(:application_instance_deregistered_event,
          host_id: host_id,
          instance_number: inst_number
        )
      ]

      for event <- events do
        expect(Trento.Commanded.Mock, :dispatch, fn %UpdateSaptuneStatus{
                                                      host_id: ^host_id,
                                                      package_version: nil,
                                                      saptune_installed: false,
                                                      sap_running: true,
                                                      status: nil
                                                    } ->
          :ok
        end)

        assert :ok == SaptuneStatusUpdateEventHandler.handle(event, %{})
      end
    end
  end

  describe "full deregistration" do
    test "should update saptune status in all hosts belonging to the system/database on deregistration" do
      %{id: database_id} = build(:database)
      %{id: sap_system_id} = build(:sap_system)
      %{id: host_id_1} = insert(:host)
      %{id: host_id_2} = insert(:host)
      insert(:database_instance, database_id: database_id, host_id: host_id_1)

      insert(:database_instance,
        database_id: database_id,
        host_id: host_id_1,
        instance_number: "10"
      )

      insert(:application_instance, sap_system_id: sap_system_id, host_id: host_id_2)
      insert(:database_instance, host_id: host_id_2, instance_number: "10")

      events = [
        build(:database_deregistered_event,
          database_id: database_id
        ),
        build(:sap_system_deregistered_event,
          sap_system_id: sap_system_id
        )
      ]

      for event <- events do
        expect(Trento.Commanded.Mock, :dispatch, 1, fn
          %UpdateSaptuneStatus{host_id: ^host_id_1, sap_running: false} -> :ok
          %UpdateSaptuneStatus{host_id: ^host_id_2, sap_running: true} -> :ok
        end)

        assert :ok == SaptuneStatusUpdateEventHandler.handle(event, %{})
      end
    end

    test "should update saptune status once per each host in the database" do
      %{id: database_id} = build(:database)
      %{id: host_id_1} = insert(:host)
      %{id: host_id_2} = insert(:host)
      %{id: host_id_3} = insert(:host)
      %{id: host_id_4} = insert(:host)

      insert(:database_instance, database_id: database_id, host_id: host_id_1)

      insert(:database_instance,
        database_id: database_id,
        host_id: host_id_1,
        instance_number: "10"
      )

      insert(:database_instance, database_id: database_id, host_id: host_id_2)

      insert(:database_instance,
        database_id: database_id,
        host_id: host_id_2,
        instance_number: "10"
      )

      insert(:database_instance, database_id: database_id, host_id: host_id_3)
      insert(:database_instance, host_id: host_id_3, instance_number: "10")

      insert(:database_instance,
        database_id: database_id,
        host_id: host_id_3,
        instance_number: "20"
      )

      insert(:database_instance, host_id: host_id_4)
      insert(:database_instance, host_id: host_id_4, instance_number: "10")

      event =
        build(:database_deregistered_event,
          database_id: database_id
        )

      expect(Trento.Commanded.Mock, :dispatch, 3, fn
        %UpdateSaptuneStatus{host_id: ^host_id_1, sap_running: false} -> :ok
        %UpdateSaptuneStatus{host_id: ^host_id_2, sap_running: false} -> :ok
        %UpdateSaptuneStatus{host_id: ^host_id_3, sap_running: true} -> :ok
      end)

      assert :ok == SaptuneStatusUpdateEventHandler.handle(event, %{})
    end
  end

  describe "restoration" do
    test "should update saptune status in all hosts belonging to the system/database on restoration" do
      %{id: database_id} = build(:database)
      %{id: sap_system_id} = build(:sap_system)
      %{id: host_id_1} = insert(:host)
      %{id: host_id_2} = insert(:host)
      insert(:database_instance, database_id: database_id, host_id: host_id_1)

      insert(:database_instance,
        database_id: database_id,
        host_id: host_id_1,
        instance_number: "10"
      )

      insert(:application_instance, sap_system_id: sap_system_id, host_id: host_id_2)

      insert(:application_instance,
        sap_system_id: sap_system_id,
        host_id: host_id_2,
        instance_number: "10"
      )

      events = [
        build(:database_restored_event,
          database_id: database_id
        ),
        build(:sap_system_restored_event,
          sap_system_id: sap_system_id
        )
      ]

      for event <- events do
        expect(Trento.Commanded.Mock, :dispatch, 1, fn
          %UpdateSaptuneStatus{host_id: ^host_id_1, sap_running: true} -> :ok
          %UpdateSaptuneStatus{host_id: ^host_id_2, sap_running: true} -> :ok
        end)

        assert :ok == SaptuneStatusUpdateEventHandler.handle(event, %{})
      end
    end
  end
end
