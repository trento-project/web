# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Infrastructure.Commanded.EventHandlers.SapSystemDatabaseHealthEventHandlerTest do
  use Trento.DataCase

  import Mox
  import Phoenix.ChannelTest
  import Trento.Factory
  import TrentoWeb.ChannelCase

  require Trento.Enums.Health, as: Health

  alias Trento.Databases.Events.DatabaseHealthChanged
  alias Trento.Infrastructure.Commanded.EventHandlers.SapSystemDatabaseHealthEventHandler
  alias Trento.SapSystems.Commands.UpdateDatabaseHealth
  alias Trento.SapSystems.Events.SapSystemDatabaseHealthChanged

  @endpoint TrentoWeb.Endpoint

  setup [:set_mox_from_context, :verify_on_exit!]

  setup do
    {:ok, _, socket} =
      TrentoWeb.UserSocket
      |> socket("user_id", %{some: :assign})
      |> subscribe_and_join(TrentoWeb.MonitoringChannel, "monitoring:sap_systems")

    %{socket: socket}
  end

  test "should dispatch UpdateDatabaseHealth commands when a database health is changed" do
    %{id: database_id} = insert(:database)

    [%{id: first_sap_system_id}, %{id: second_sap_system_id}] =
      insert_list(2, :sap_system, database_id: database_id)

    event = %DatabaseHealthChanged{database_id: database_id, health: :critical}

    expect(Trento.Commanded.Mock, :dispatch, fn %UpdateDatabaseHealth{
                                                  sap_system_id: ^first_sap_system_id,
                                                  database_health: :critical
                                                },
                                                _ ->
      :ok
    end)

    expect(Trento.Commanded.Mock, :dispatch, fn %UpdateDatabaseHealth{
                                                  sap_system_id: ^second_sap_system_id,
                                                  database_health: :critical
                                                },
                                                _ ->
      :ok
    end)

    assert :ok = SapSystemDatabaseHealthEventHandler.handle(event, %{})
  end

  test "should broadcast database health change when a SapSystemDatabaseHealthChanged event is received" do
    sap_system_id = Faker.UUID.v4()

    event = %SapSystemDatabaseHealthChanged{
      sap_system_id: sap_system_id,
      database_health: Health.critical()
    }

    assert :ok = SapSystemDatabaseHealthEventHandler.handle(event, %{})

    assert_broadcast(
      "sap_system_updated",
      %{
        id: ^sap_system_id,
        database_health: Health.critical()
      },
      1000
    )
  end
end
