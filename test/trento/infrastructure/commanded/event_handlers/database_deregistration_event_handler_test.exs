defmodule Trento.Infrastructure.Commanded.EventHandlers.DatabaseDeregistrationEventHandlerTest do
  use ExUnit.Case
  use Trento.DataCase

  import Mox
  import Trento.Factory

  alias Trento.Databases.Events.DatabaseDeregistered
  alias Trento.Infrastructure.Commanded.EventHandlers.DatabaseDeregistrationEventHandler
  alias Trento.SapSystems.Commands.DeregisterSapSystem

  setup [:set_mox_from_context, :verify_on_exit!]

  test "should dispatch DeregisterSapSystem commands when a database is deregistered" do
    %{id: database_id} = insert(:database)

    [%{id: first_sap_system_id}, %{id: second_sap_system_id}] =
      insert_list(2, :sap_system, database_id: database_id)

    deregistered_at = DateTime.utc_now()
    event = %DatabaseDeregistered{database_id: database_id, deregistered_at: deregistered_at}

    expect(Trento.Commanded.Mock, :dispatch, fn %DeregisterSapSystem{
                                                  sap_system_id: ^first_sap_system_id,
                                                  deregistered_at: ^deregistered_at
                                                },
                                                _ ->
      :ok
    end)

    expect(Trento.Commanded.Mock, :dispatch, fn %DeregisterSapSystem{
                                                  sap_system_id: ^second_sap_system_id,
                                                  deregistered_at: ^deregistered_at
                                                },
                                                _ ->
      :ok
    end)

    assert :ok = DatabaseDeregistrationEventHandler.handle(event, %{})
  end
end
