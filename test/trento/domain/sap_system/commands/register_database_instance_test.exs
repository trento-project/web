defmodule Trento.Domain.Commands.RegisterDatabaseInstanceTest do
  use ExUnit.Case

  import Trento.Factory

  @moduletag :unit

  test "should not validate if sap_system_id is not a valid uuid" do
    command =
      register_database_instance_command(
        sap_system_id: Faker.String.naughty(),
        sid: Faker.StarWars.planet(),
        tenant: Faker.Beer.style(),
        host_id: Faker.UUID.v4(),
        instance_number: "10",
        features: Faker.Pokemon.name(),
        health: :passing
      )

    assert not Vex.valid?(command)
  end

  test "should not validate if host_id is not a valid uuid" do
    command = register_database_instance_command(host_id: Faker.String.naughty())

    assert not Vex.valid?(command)
  end
end
