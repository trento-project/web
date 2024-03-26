defmodule Trento.Infrastructure.Commanded.EventHandlers.SapSystemDatabaseHealthEventHandlerTest do
  use ExUnit.Case
  use Trento.DataCase

  import Mox
  import Trento.Factory

  alias Trento.Databases.Events.DatabaseHealthChanged
  alias Trento.Infrastructure.Commanded.EventHandlers.SapSystemDatabaseHealthEventHandler
  alias Trento.SapSystems.Commands.UpdateDatabaseHealth

  setup [:set_mox_from_context, :verify_on_exit!]

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
end
