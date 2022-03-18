defmodule Trento.Domain.Commands.UpdateHeartbeatTest do
  use ExUnit.Case

  alias Trento.Domain.Commands.UpdateHeartbeat

  @moduletag :unit

  test "should not validate if host_id is not a valid uuid" do
    command =
      UpdateHeartbeat.new!(%{
        host_id: Faker.StarWars.character(),
        heartbeat: :passing
      })

    assert not Vex.valid?(command)
  end
end
