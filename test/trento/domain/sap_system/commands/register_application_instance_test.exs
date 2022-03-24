defmodule Trento.Domain.Commands.RegisterApplicationInstanceTest do
  use ExUnit.Case

  alias Trento.Domain.Commands.RegisterApplicationInstance

  import Trento.Factory

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
        instance_hostname: "theinstancename",
        features: Faker.Pokemon.name(),
        http_port: 8080,
        https_port: 8443,
        start_priority: "0.2",
        health: :passing
      })

    assert not Vex.valid?(command)
  end

  test "should not validate if host_id is not a valid uuid" do
    command = register_application_instance_command(host_id: Faker.String.naughty())

    assert not Vex.valid?(command)
  end
end
