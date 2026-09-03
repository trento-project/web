# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Infrastructure.Commanded.EventHandlers.SapSystemDatabaseStaleAtEventHandlerTest do
  use Trento.DataCase

  import Mox
  import Phoenix.ChannelTest
  import Trento.Factory
  import TrentoWeb.ChannelCase

  alias Trento.Databases.Events.{DatabaseDataMarkedInSync, DatabaseDataMarkedStale}

  alias Trento.Infrastructure.Commanded.EventHandlers.SapSystemDatabaseStaleAtEventHandler

  alias Trento.SapSystems.Commands.UpdateDatabaseStaleAt
  alias Trento.SapSystems.Events.SapSystemDatabaseStaleAtChanged

  @endpoint TrentoWeb.Endpoint

  setup [:set_mox_from_context, :verify_on_exit!]

  setup do
    {:ok, _, socket} =
      TrentoWeb.UserSocket
      |> socket("user_id", %{some: :assign})
      |> subscribe_and_join(TrentoWeb.MonitoringChannel, "monitoring:sap_systems")

    %{socket: socket}
  end

  test "should dispatch UpdateDatabaseStaleAt commands when a database is marked stale" do
    %{id: database_id} = insert(:database)

    [%{id: first_sap_system_id}, %{id: second_sap_system_id}] =
      insert_list(2, :sap_system, database_id: database_id)

    stale_at = DateTime.utc_now()

    event = %DatabaseDataMarkedStale{database_id: database_id, stale_at: stale_at}

    metadata = %{
      correlation_id: Faker.UUID.v4(),
      causation_id: Faker.UUID.v4()
    }

    expect(Trento.Commanded.Mock, :dispatch, fn %UpdateDatabaseStaleAt{
                                                  sap_system_id: ^first_sap_system_id,
                                                  database_stale_at: ^stale_at
                                                },
                                                _ ->
      :ok
    end)

    expect(Trento.Commanded.Mock, :dispatch, fn %UpdateDatabaseStaleAt{
                                                  sap_system_id: ^second_sap_system_id,
                                                  database_stale_at: ^stale_at
                                                },
                                                _ ->
      :ok
    end)

    assert :ok = SapSystemDatabaseStaleAtEventHandler.handle(event, metadata)
  end

  test "should dispatch UpdateDatabaseStaleAt commands with nil when a database is marked in-sync" do
    %{id: database_id} = insert(:database)

    [%{id: first_sap_system_id}, %{id: second_sap_system_id}] =
      insert_list(2, :sap_system, database_id: database_id)

    event = %DatabaseDataMarkedInSync{database_id: database_id}

    metadata = %{
      correlation_id: Faker.UUID.v4(),
      causation_id: Faker.UUID.v4()
    }

    expect(Trento.Commanded.Mock, :dispatch, fn %UpdateDatabaseStaleAt{
                                                  sap_system_id: ^first_sap_system_id,
                                                  database_stale_at: nil
                                                },
                                                _ ->
      :ok
    end)

    expect(Trento.Commanded.Mock, :dispatch, fn %UpdateDatabaseStaleAt{
                                                  sap_system_id: ^second_sap_system_id,
                                                  database_stale_at: nil
                                                },
                                                _ ->
      :ok
    end)

    assert :ok = SapSystemDatabaseStaleAtEventHandler.handle(event, metadata)
  end

  test "should not dispatch any command when the database does not have associated SAP systems" do
    event = %DatabaseDataMarkedStale{
      database_id: Faker.UUID.v4(),
      stale_at: DateTime.utc_now()
    }

    metadata = %{
      correlation_id: Faker.UUID.v4(),
      causation_id: Faker.UUID.v4()
    }

    expect(Trento.Commanded.Mock, :dispatch, 0, fn _ -> :ok end)

    assert :ok = SapSystemDatabaseStaleAtEventHandler.handle(event, metadata)
  end

  test "should broadcast database stale_at change when a SapSystemDatabaseStaleAtChanged event is received" do
    sap_system_id = Faker.UUID.v4()
    stale_at = DateTime.utc_now()

    event = %SapSystemDatabaseStaleAtChanged{
      sap_system_id: sap_system_id,
      database_stale_at: stale_at
    }

    assert :ok = SapSystemDatabaseStaleAtEventHandler.handle(event, %{})

    assert_broadcast(
      "sap_system_updated",
      %{
        id: ^sap_system_id,
        database_stale_at: ^stale_at
      },
      1000
    )
  end
end
