defmodule Trento.Monitoring.Domain.Commands.RegisterHostTest do
  use ExUnit.Case

  alias Trento.Monitoring.Domain.Commands.RegisterHost

  @moduletag :unit

  test "should not validate if host_id is not a valid uuid" do
    command =
      RegisterHost.new!(%{
        host_id: Faker.StarWars.character(),
        hostname: Faker.String.naughty(),
        ip_addresses: [Faker.Internet.ip_v4_address()],
        agent_version: Faker.App.version(),
        cpu_count: Enum.random(1..16),
        total_memory_mb: Enum.random(1..128),
        socket_count: Enum.random(1..16),
        os_version: Faker.App.version()
      })

    assert not Vex.valid?(command)
  end
end
