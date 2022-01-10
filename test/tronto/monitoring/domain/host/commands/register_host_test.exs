defmodule Tronto.Monitoring.Domain.Commands.RegisterHostTest do
  use ExUnit.Case

  alias Tronto.Monitoring.Domain.Commands.RegisterHost

  @moduletag :unit

  test "should not validate if id_host is not a valid uuid" do
    command =
      RegisterHost.new!(%{
        id_host: Faker.StarWars.character(),
        hostname: Faker.String.naughty(),
        ip_addresses: [Faker.Internet.ip_v4_address()],
        agent_version: Faker.App.version()
      })

    assert not Vex.valid?(command)
  end
end
