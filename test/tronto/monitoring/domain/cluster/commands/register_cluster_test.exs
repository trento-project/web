defmodule Tronto.Monitoring.Domain.Commands.RegisterClusterTest do
  use ExUnit.Case

  alias Tronto.Monitoring.Domain.Commands.RegisterCluster

  @moduletag :unit

  test "should not validate if id_cluster is not a valid uuid" do
    command =
      RegisterCluster.new!(%{
        id_cluster: Faker.String.naughty(),
        id_host: Faker.UUID.v4(),
        name: Faker.StarWars.character(),
        sid: Faker.Lorem.word(),
        type: :unknown
      })

    assert not Vex.valid?(command)
  end

  test "should not validate if id_host is not a valid uuid" do
    command =
      RegisterCluster.new!(%{
        id_cluster: Faker.UUID.v4(),
        id_host: Faker.String.naughty(),
        name: Faker.StarWars.character(),
        sid: Faker.Lorem.word(),
        type: :unknown
      })

    assert not Vex.valid?(command)
  end
end
