defmodule Tronto.Monitoring.HeartbeatsTest do
  use ExUnit.Case
  use Tronto.DataCase

  import Mock

  alias Tronto.Monitoring.{
    Heartbeat,
    Heartbeats
  }

  alias Tronto.Repo

  @moduletag :integration

  test "create new heartbeat" do
    now = DateTime.utc_now()

    with_mock DateTime, [:passthrough], utc_now: fn -> now end do
      agent_id = Faker.UUID.v4()
      Heartbeats.heartbeat(agent_id)

      [heartbeat] = Repo.all(Heartbeat)

      assert heartbeat.agent_id == agent_id
      assert heartbeat.timestamp == now
    end
  end

  test "update existing heartbeat" do
    agent_id = Faker.UUID.v4()
    Heartbeats.heartbeat(agent_id)

    now = DateTime.utc_now()

    with_mock DateTime, [:passthrough], utc_now: fn -> now end do
      Heartbeats.heartbeat(agent_id)

      [heartbeat] = Repo.all(Heartbeat)

      assert heartbeat.timestamp == now
    end
  end

  test "dispatch commands on heartbeat expiration" do
    agent_id = Faker.UUID.v4()
    Heartbeats.heartbeat(agent_id)

    now =
      DateTime.add(
        DateTime.utc_now(),
        Application.get_env(:tronto, Heartbeats)[:interval] + 1,
        :millisecond
      )

    with_mocks [
      {DateTime, [:passthrough], utc_now: fn -> now end},
      {Heartbeats, [:passthrough], dispatch_command: fn _ -> {:ok, :done} end}
    ] do
      Heartbeats.dispatch_heartbeat_failed_commands()

      assert [] == Repo.all(Heartbeat)
      assert_called(Heartbeats.dispatch_command(agent_id))
    end
  end
end
