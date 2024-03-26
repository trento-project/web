defmodule Trento.Infrastructure.Commanded.Middleware.EnrichRegisterApplicationInstanceTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.Infrastructure.Commanded.Middleware.Enrichable
  alias Trento.SapSystems.Commands.RegisterApplicationInstance

  test "should return an enriched command if the database was found by the ip and tenant" do
    %{
      database_id: database_id,
      tenant: tenant,
      host: %{ip_addresses: [ip]}
    } = insert(:database_instance)

    command =
      build(
        :register_application_instance_command,
        sap_system_id: nil,
        sid: Faker.StarWars.planet(),
        db_host: ip,
        tenant: tenant,
        instance_number: "00",
        features: Faker.Pokemon.name(),
        host_id: Faker.UUID.v4(),
        health: :passing
      )

    expected_sap_system_id = UUID.uuid5(database_id, tenant)

    assert {:ok,
            %RegisterApplicationInstance{
              sap_system_id: ^expected_sap_system_id,
              database_id: ^database_id
            }} =
             Enrichable.enrich(command, %{})
  end

  test "should return a database not found error if the database instance host has been deregistered" do
    deregistered_host = insert(:host, deregistered_at: DateTime.utc_now())

    %{
      tenant: tenant,
      host: %{ip_addresses: [ip]}
    } =
      insert(:database_instance_without_host,
        host_id: deregistered_host.id,
        host: deregistered_host
      )

    command =
      build(
        :register_application_instance_command,
        sap_system_id: nil,
        sid: Faker.StarWars.planet(),
        db_host: ip,
        tenant: tenant,
        instance_number: "00",
        features: Faker.Pokemon.name(),
        host_id: Faker.UUID.v4(),
        health: :passing
      )

    assert {:error, :database_not_registered} = Enrichable.enrich(command, %{})
  end

  test "should return an error if the database was not found" do
    %{
      tenant: tenant
    } = insert(:database_instance)

    command =
      build(
        :register_application_instance_command,
        sap_system_id: nil,
        sid: Faker.StarWars.planet(),
        db_host: "not_found",
        tenant: tenant,
        instance_number: "00",
        features: Faker.Pokemon.name(),
        host_id: Faker.UUID.v4(),
        health: :passing
      )

    assert {:error, :database_not_registered} = Enrichable.enrich(command, %{})
  end
end
