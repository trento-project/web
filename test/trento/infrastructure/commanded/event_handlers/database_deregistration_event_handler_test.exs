defmodule Trento.Infrastructure.Commanded.EventHandlers.DatabaseDeregistrationEventHandlerTest do
  use ExUnit.Case
  use Trento.DataCase

  import Mox
  import Trento.Factory

  alias Trento.Databases.Events.{
    DatabaseDeregistered,
    DatabaseTenantsUpdated
  }

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

  test "should dispatch DeregisterSapSystem commands when a tenant is removed" do
    [%{name: tenant1}, %{name: tenant2}] = tenants = build_list(2, :tenant)
    %{id: database_id} = insert(:database, tenants: tenants)

    insert(:sap_system, database_id: database_id, tenant: tenant1)
    %{id: second_sap_system_id} = insert(:sap_system, database_id: database_id, tenant: tenant2)
    insert(:sap_system, database_id: database_id)

    event = %DatabaseTenantsUpdated{
      database_id: database_id,
      tenants: Enum.take(tenants, 1),
      previous_tenants: tenants
    }

    deregistered_at = DateTime.utc_now()

    expect(Trento.Commanded.Mock, :dispatch, fn %DeregisterSapSystem{
                                                  sap_system_id: ^second_sap_system_id,
                                                  deregistered_at: ^deregistered_at
                                                },
                                                _ ->
      :ok
    end)

    assert :ok = DatabaseDeregistrationEventHandler.handle(event, %{created_at: deregistered_at})
  end

  test "should not dispatch DeregisterSapSystem commands if tenants are added" do
    tenants = build_list(2, :tenant)
    %{id: database_id} = insert(:database, tenants: tenants)

    event = %DatabaseTenantsUpdated{
      database_id: database_id,
      tenants: tenants,
      previous_tenants: Enum.take(tenants, 1)
    }

    expect(Trento.Commanded.Mock, :dispatch, 0, fn _ -> :ok end)

    assert :ok =
             DatabaseDeregistrationEventHandler.handle(event, %{created_at: DateTime.utc_now()})
  end
end
