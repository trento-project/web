defmodule Trento.Infrastructure.Commanded.EventHandlers.DatabaseRestoreEventHandlerTest do
  use ExUnit.Case
  use Trento.DataCase

  import Mox
  import Trento.Factory

  alias Trento.Databases.Events.DatabaseRestored
  alias Trento.Infrastructure.Commanded.EventHandlers.DatabaseRestoreEventHandler
  alias Trento.SapSystems.Commands.RestoreSapSystem

  setup [:set_mox_from_context, :verify_on_exit!]

  test "should dispatch RestoreSapSystem commands when a database is restored" do
    %{id: database_id} = insert(:database)

    %{id: sap_system_id, tenant: tenant, db_host: db_host} =
      insert(:sap_system, database_id: database_id)

    event = %DatabaseRestored{database_id: database_id}

    expect(Trento.Commanded.Mock, :dispatch, fn %RestoreSapSystem{
                                                  sap_system_id: ^sap_system_id,
                                                  tenant: ^tenant,
                                                  db_host: ^db_host
                                                },
                                                _ ->
      :ok
    end)

    assert :ok = DatabaseRestoreEventHandler.handle(event, %{})
  end
end
