defmodule Trento.EnrichRegisterApplicationInstanceTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.Domain.Commands.RegisterApplicationInstance
  alias Trento.Support.Middleware.Enrichable

  test "should return an enriched command if the database was found by the ip and tenant" do
    %{
      sap_system_id: sap_system_id,
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

    assert {:ok, %RegisterApplicationInstance{sap_system_id: ^sap_system_id}} =
             Enrichable.enrich(command, %{})
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

    assert {:error, :database_not_found} = Enrichable.enrich(command, %{})
  end
end
