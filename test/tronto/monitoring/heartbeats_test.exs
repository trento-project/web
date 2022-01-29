defmodule Tronto.Monitoring.HeartbeatsTest do
  use ExUnit.Case
  use Tronto.DataCase

  import Mock

  alias Tronto.Monitoring.{
    Heartbeat,
    Heartbeats
  }

  alias Tronto.Monitoring.Domain.Commands.UpdateHeartbeat

  alias Tronto.Repo

  @moduletag :integration

  test "create new heartbeat" do
    now = DateTime.utc_now()

    with_mocks [
      {DateTime, [:passthrough], utc_now: fn -> now end},
      {Tronto.Commanded, [:passthrough], dispatch: fn _ -> :ok end}
    ] do
      agent_id = Faker.UUID.v4()
      Heartbeats.heartbeat(agent_id)

      [heartbeat] = Repo.all(Heartbeat)

      assert heartbeat.agent_id == agent_id
      assert heartbeat.timestamp == now

      assert_called Tronto.Commanded.dispatch(%UpdateHeartbeat{
                      host_id: agent_id,
                      heartbeat: :passing
                    })
    end
  end

  test "update existing heartbeat" do
    agent_id = Faker.UUID.v4()

    with_mock Tronto.Commanded, [:passthrough], dispatch: fn _ -> :ok end do
      Heartbeats.heartbeat(agent_id)
    end

    now = DateTime.utc_now()

    with_mocks [
      {DateTime, [:passthrough], utc_now: fn -> now end},
      {Tronto.Commanded, [:passthrough], dispatch: fn _ -> :ok end}
    ] do
      Heartbeats.heartbeat(agent_id)

      [heartbeat] = Repo.all(Heartbeat)

      assert heartbeat.timestamp == now

      assert_not_called Tronto.Commanded.dispatch(:_)
    end
  end

  test "dispatch commands on heartbeat expiration" do
    agent_id = Faker.UUID.v4()

    with_mock Tronto.Commanded, [:passthrough], dispatch: fn _ -> :ok end do
      Heartbeats.heartbeat(agent_id)
    end

    now =
      DateTime.add(
        DateTime.utc_now(),
        Application.get_env(:tronto, Heartbeats)[:interval] + 1,
        :millisecond
      )

    with_mocks [
      {DateTime, [:passthrough], utc_now: fn -> now end},
      {Tronto.Commanded, [:passthrough], dispatch: fn _ -> :ok end}
    ] do
      Heartbeats.dispatch_heartbeat_failed_commands()

      assert [] == Repo.all(Heartbeat)

      assert_called Tronto.Commanded.dispatch(%UpdateHeartbeat{
                      host_id: agent_id,
                      heartbeat: :critical
                    })
    end
  end
end
