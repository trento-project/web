defmodule Trento.Infrastructure.Commanded.Middleware.EnrichRegisterApplicationInstanceTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.Infrastructure.Commanded.Middleware.Enrichable
  alias Trento.SapSystems.Commands.RegisterApplicationInstance

  test "should return an enriched command if the database was found by the ip and tenant" do
    [%{name: tenant_name}, _] = tenants = build_list(2, :tenant)

    %{id: database_id, health: health} = insert(:database, tenants: tenants)

    %{
      host: %{ip_addresses: [ip]}
    } = insert(:database_instance, database_id: database_id)

    command =
      build(
        :register_application_instance_command,
        sap_system_id: nil,
        db_host: ip,
        tenant: tenant_name,
        instance_number: "00",
        features: Faker.Pokemon.name(),
        host_id: Faker.UUID.v4(),
        health: :passing
      )

    expected_sap_system_id = UUID.uuid5(database_id, tenant_name)

    assert {:ok,
            %RegisterApplicationInstance{
              sap_system_id: ^expected_sap_system_id,
              database_id: ^database_id,
              database_health: ^health
            }} =
             Enrichable.enrich(command, %{})
  end

  test "should return a database not found error if the database instance host has been deregistered" do
    [%{name: tenant_name}, _] = tenants = build_list(2, :tenant)

    %{id: database_id} = insert(:database, tenants: tenants)

    deregistered_host = insert(:host, deregistered_at: DateTime.utc_now())

    %{
      host: %{ip_addresses: [ip]}
    } =
      insert(:database_instance_without_host,
        database_id: database_id,
        host_id: deregistered_host.id,
        database_id: database_id,
        host: deregistered_host
      )

    command =
      build(
        :register_application_instance_command,
        sap_system_id: nil,
        db_host: ip,
        tenant: tenant_name,
        instance_number: "00",
        features: Faker.Pokemon.name(),
        host_id: Faker.UUID.v4(),
        health: :passing
      )

    assert {:error, :associated_database_not_found} = Enrichable.enrich(command, %{})
  end

  test "should return an error if the database was not found" do
    command =
      build(
        :register_application_instance_command,
        sap_system_id: nil,
        sid: Faker.StarWars.planet(),
        db_host: "not_found",
        tenant: "the tenant",
        instance_number: "00",
        features: Faker.Pokemon.name(),
        host_id: Faker.UUID.v4(),
        health: :passing
      )

    assert {:error, :associated_database_not_found} = Enrichable.enrich(command, %{})
  end
end
