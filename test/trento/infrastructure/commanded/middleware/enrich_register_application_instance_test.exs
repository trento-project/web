defmodule Trento.Infrastructure.Commanded.Middleware.EnrichRegisterApplicationInstanceTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.Infrastructure.Commanded.Middleware.Enrichable
  alias Trento.SapSystems.Commands.RegisterApplicationInstance

  test "should return an enriched command if the database was found by the ip and tenant" do
    %{
      id: database_id,
      health: health
    } = insert(:database)

    %{
      tenant: tenant,
      host: %{ip_addresses: [ip]}
    } = insert(:database_instance, database_id: database_id)

    command =
      build(
        :register_application_instance_command,
        sap_system_id: nil,
        db_host: ip,
        tenant: tenant
      )

    expected_sap_system_id = UUID.uuid5(database_id, tenant)

    assert {:ok,
            %RegisterApplicationInstance{
              sap_system_id: ^expected_sap_system_id,
              database_id: ^database_id,
              database_health: ^health
            }} =
             Enrichable.enrich(command, %{})
  end

  test "should return a database not found error if the database instance host has been deregistered" do
    deregistered_host = insert(:host, deregistered_at: DateTime.utc_now())

    %{id: database_id} = insert(:database)

    %{
      tenant: tenant,
      host: %{ip_addresses: [ip]}
    } =
      insert(:database_instance_without_host,
        database_id: database_id,
        host_id: deregistered_host.id,
        host: deregistered_host
      )

    command =
      build(
        :register_application_instance_command,
        sap_system_id: nil,
        db_host: ip,
        tenant: tenant
      )

    assert {:error, :database_not_registered} = Enrichable.enrich(command, %{})
  end

  test "should return an error if the database was not found" do
    command =
      build(
        :register_application_instance_command,
        sap_system_id: nil
      )

    assert {:error, :database_not_registered} = Enrichable.enrich(command, %{})
  end
end
