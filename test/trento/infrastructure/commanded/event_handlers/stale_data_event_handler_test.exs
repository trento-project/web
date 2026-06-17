# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Infrastructure.Commanded.EventHandlers.StaleDataEventHandlerTest do
  use Trento.DataCase

  import Mox
  import Trento.Factory

  alias Trento.Hosts.Events.HeartbeatFailed
  alias Trento.Infrastructure.Commanded.EventHandlers.StaleDataEventHandler
  alias Trento.SapSystems.Commands.MarkApplicationInstanceDataStale

  setup [:set_mox_from_context, :verify_on_exit!]

  test "should dispatch MarkApplicationInstanceDataStale commands when heartbeat fails" do
    host_id = Faker.UUID.v4()
    %{id: sap_system_id} = insert(:sap_system)

    insert(:application_instance,
      sap_system_id: sap_system_id,
      host_id: host_id,
      instance_number: "00"
    )

    insert(:application_instance,
      sap_system_id: sap_system_id,
      host_id: host_id,
      instance_number: "10"
    )

    event = %HeartbeatFailed{host_id: host_id}
    correlation_id = UUID.uuid4()

    expect(Trento.Commanded.Mock, :dispatch, fn
      %MarkApplicationInstanceDataStale{
        sap_system_id: ^sap_system_id,
        instance_number: "00",
        host_id: ^host_id
      },
      [correlation_id: ^correlation_id, causation_id: ^correlation_id] ->
        :ok
    end)

    expect(Trento.Commanded.Mock, :dispatch, fn
      %MarkApplicationInstanceDataStale{
        sap_system_id: ^sap_system_id,
        instance_number: "10",
        host_id: ^host_id
      },
      [correlation_id: ^correlation_id, causation_id: ^correlation_id] ->
        :ok
    end)

    assert :ok = StaleDataEventHandler.handle(event, %{correlation_id: correlation_id})
  end

  test "should not dispatch commands when no application instances exist on the host" do
    host_id = Faker.UUID.v4()
    event = %HeartbeatFailed{host_id: host_id}
    correlation_id = UUID.uuid4()

    expect(Trento.Commanded.Mock, :dispatch, 0, fn _, _ -> :ok end)

    assert :ok = StaleDataEventHandler.handle(event, %{correlation_id: correlation_id})
  end

  test "should dispatch commands only for instances on the failed host" do
    failed_host_id = Faker.UUID.v4()
    other_host_id = Faker.UUID.v4()
    %{id: sap_system_id} = insert(:sap_system)

    insert(:application_instance,
      sap_system_id: sap_system_id,
      host_id: failed_host_id,
      instance_number: "00"
    )

    insert(:application_instance,
      sap_system_id: sap_system_id,
      host_id: other_host_id,
      instance_number: "10"
    )

    event = %HeartbeatFailed{host_id: failed_host_id}
    correlation_id = UUID.uuid4()

    expect(Trento.Commanded.Mock, :dispatch, fn %MarkApplicationInstanceDataStale{
                                                  sap_system_id: ^sap_system_id,
                                                  instance_number: "00",
                                                  host_id: ^failed_host_id
                                                },
                                                _ ->
      :ok
    end)

    assert :ok = StaleDataEventHandler.handle(event, %{correlation_id: correlation_id})
  end

  test "should handle multiple SAP systems on the same host" do
    host_id = Faker.UUID.v4()
    %{id: first_sap_system_id} = insert(:sap_system)
    %{id: second_sap_system_id} = insert(:sap_system)

    insert(:application_instance,
      sap_system_id: first_sap_system_id,
      host_id: host_id,
      instance_number: "00"
    )

    insert(:application_instance,
      sap_system_id: second_sap_system_id,
      host_id: host_id,
      instance_number: "01"
    )

    event = %HeartbeatFailed{host_id: host_id}
    correlation_id = UUID.uuid4()

    expect(Trento.Commanded.Mock, :dispatch, fn %MarkApplicationInstanceDataStale{
                                                  sap_system_id: ^first_sap_system_id,
                                                  instance_number: "00",
                                                  host_id: ^host_id
                                                },
                                                _ ->
      :ok
    end)

    expect(Trento.Commanded.Mock, :dispatch, fn %MarkApplicationInstanceDataStale{
                                                  sap_system_id: ^second_sap_system_id,
                                                  instance_number: "01",
                                                  host_id: ^host_id
                                                },
                                                _ ->
      :ok
    end)

    assert :ok = StaleDataEventHandler.handle(event, %{correlation_id: correlation_id})
  end
end
