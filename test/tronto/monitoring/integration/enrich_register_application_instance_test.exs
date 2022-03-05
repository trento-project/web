defmodule Tronto.Monitoring.EnrichRegisterApplicationInstanceTest do
  use ExUnit.Case
  use Tronto.DataCase

  import Tronto.Factory

  alias Tronto.Monitoring.Domain.Commands.RegisterApplicationInstance
  alias Tronto.Support.Middleware.Enrichable

  test "should return an enriched command if the database was found by the hostname and tenant" do
    %{
      sap_system_id: sap_system_id,
      tenant: tenant,
      host: %{hostname: hostname}
    } = database_instance_projection()

    command =
      RegisterApplicationInstance.new!(
        sap_system_id: nil,
        sid: Faker.StarWars.planet(),
        db_host: hostname,
        tenant: tenant,
        instance_number: "00",
        features: Faker.Pokemon.name(),
        host_id: Faker.UUID.v4()
      )

    assert {:ok, %RegisterApplicationInstance{sap_system_id: ^sap_system_id}} =
             Enrichable.enrich(command, %{})
  end

  test "should return an enriched command if the database was found by the ip and tenant" do
    %{
      sap_system_id: sap_system_id,
      tenant: tenant,
      host: %{ip_addresses: [ip]}
    } = database_instance_projection()

    command =
      RegisterApplicationInstance.new!(
        sap_system_id: nil,
        sid: Faker.StarWars.planet(),
        db_host: ip,
        tenant: tenant,
        instance_number: "00",
        features: Faker.Pokemon.name(),
        host_id: Faker.UUID.v4()
      )

    assert {:ok, %RegisterApplicationInstance{sap_system_id: ^sap_system_id}} =
             Enrichable.enrich(command, %{})
  end

  test "should return an error if the database was not found" do
    %{
      tenant: tenant
    } = database_instance_projection()

    command =
      RegisterApplicationInstance.new!(
        sap_system_id: nil,
        sid: Faker.StarWars.planet(),
        db_host: "not_found",
        tenant: tenant,
        instance_number: "00",
        features: Faker.Pokemon.name(),
        host_id: Faker.UUID.v4()
      )

    assert {:error, :database_not_found} = Enrichable.enrich(command, %{})
  end
end
