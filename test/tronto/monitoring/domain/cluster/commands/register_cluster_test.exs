defmodule Tronto.Monitoring.Domain.Commands.RegisterClusterHostTest do
  use ExUnit.Case

  alias Tronto.Monitoring.Domain.Commands.RegisterClusterHost

  @moduletag :unit

  test "should not validate if cluster_id is not a valid uuid" do
    command =
      RegisterClusterHost.new!(%{
        cluster_id: Faker.String.naughty(),
        host_id: Faker.UUID.v4(),
        name: Faker.StarWars.character(),
        sid: Faker.Lorem.word(),
        type: :unknown,
        designated_controller: false
      })

    assert not Vex.valid?(command)
  end

  test "should not validate if host_id is not a valid uuid" do
    command =
      RegisterClusterHost.new!(%{
        cluster_id: Faker.UUID.v4(),
        host_id: Faker.String.naughty(),
        name: Faker.StarWars.character(),
        sid: Faker.Lorem.word(),
        type: :unknown,
        designated_controller: false
      })

    assert not Vex.valid?(command)
  end
end
