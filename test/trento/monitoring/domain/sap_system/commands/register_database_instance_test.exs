defmodule Trento.Monitoring.Domain.Commands.RegisterDatabaseInstanceTest do
  use ExUnit.Case

  alias Trento.Monitoring.Domain.Commands.RegisterDatabaseInstance

  @moduletag :unit

  test "should not validate if sap_system_id is not a valid uuid" do
    command =
      RegisterDatabaseInstance.new!(%{
        sap_system_id: Faker.String.naughty(),
        sid: Faker.StarWars.planet(),
        tenant: Faker.Beer.style(),
        host_id: Faker.UUID.v4(),
        instance_number: "10",
        features: Faker.Pokemon.name(),
        health: :passing
      })

    assert not Vex.valid?(command)
  end

  test "should not validate if host_id is not a valid uuid" do
    command =
      RegisterDatabaseInstance.new!(%{
        sap_system_id: Faker.UUID.v4(),
        sid: Faker.StarWars.planet(),
        tenant: Faker.Beer.style(),
        host_id: Faker.String.naughty(),
        instance_number: "10",
        features: Faker.Pokemon.name(),
        health: :passing
      })

    assert not Vex.valid?(command)
  end
end
