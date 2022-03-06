defmodule Tronto.Monitoring.Domain.Commands.RegisterApplicationInstanceTest do
  use ExUnit.Case

  alias Tronto.Monitoring.Domain.Commands.RegisterApplicationInstance

  @moduletag :unit

  test "should not validate if sap_system_id is not a valid uuid" do
    command =
      RegisterApplicationInstance.new!(%{
        sap_system_id: Faker.String.naughty(),
        sid: Faker.StarWars.planet(),
        db_host: Faker.Internet.ip_v4_address(),
        tenant: Faker.Beer.style(),
        host_id: Faker.UUID.v4(),
        instance_number: "10",
        features: Faker.Pokemon.name()
      })

    assert not Vex.valid?(command)
  end

  test "should not validate if host_id is not a valid uuid" do
    command =
      RegisterApplicationInstance.new!(%{
        sap_system_id: Faker.UUID.v4(),
        sid: Faker.StarWars.planet(),
        db_host: Faker.Internet.ip_v4_address(),
        tenant: Faker.Beer.style(),
        host_id: Faker.String.naughty(),
        instance_number: "10",
        features: Faker.Pokemon.name()
      })

    assert not Vex.valid?(command)
  end
end
