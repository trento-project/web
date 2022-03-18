defmodule Trento.Domain.Commands.UpdateSlesSubscriptionsTest do
  use ExUnit.Case

  alias Trento.Domain.Commands.UpdateSlesSubscriptions
  alias Trento.Domain.SlesSubscription

  @moduletag :unit

  test "should not validate if host_id is not a valid uuid" do
    command =
      UpdateSlesSubscriptions.new!(%{
        host_id: Faker.StarWars.character(),
        subscriptions: [
          SlesSubscription.new!(
            host_id: Faker.StarWars.character(),
            identifier: Faker.StarWars.planet(),
            version: Faker.StarWars.character(),
            arch: "x86_64",
            status: "active"
          )
        ]
      })

    assert not Vex.valid?(command)
  end
end
