defmodule Trento.HeartbeatsTest do
  use ExUnit.Case
  use Trento.DataCase

  import Mox
  import Mock

  import Trento.Factory

  alias Trento.{
    Heartbeat,
    Heartbeats
  }

  alias Trento.Domain.Commands.UpdateHeartbeat

  alias Trento.Repo

  @moduletag :integration

  setup [:set_mox_from_context, :verify_on_exit!]

  test "create new heartbeat" do
    now = DateTime.utc_now()
    agent_id = Faker.UUID.v4()

    with_mock DateTime, [:passthrough], utc_now: fn -> now end do
      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn command ->
          assert %UpdateHeartbeat{
                   host_id: ^agent_id,
                   heartbeat: :passing
                 } = command

          :ok
        end
      )

      Heartbeats.heartbeat(agent_id)

      [heartbeat] = Repo.all(Heartbeat)

      assert heartbeat.agent_id == agent_id
      assert heartbeat.timestamp == now
    end
  end

  test "update existing heartbeat" do
    agent_id = Faker.UUID.v4()
    insert(:host, id: agent_id, heartbeat: :critical)
    %{timestamp: now} = insert(:heartbeat, agent_id: agent_id)

    updated_time =
      DateTime.add(
        now,
        Application.get_env(:trento, Heartbeats)[:interval] + 1,
        :millisecond
      )

    with_mock DateTime, [:passthrough], utc_now: fn -> updated_time end do
      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn command ->
          assert %UpdateHeartbeat{
                   host_id: ^agent_id,
                   heartbeat: :passing
                 } = command

          :ok
        end
      )

      Heartbeats.heartbeat(agent_id)

      [heartbeat] = Repo.all(Heartbeat)

      assert heartbeat.timestamp == updated_time
    end
  end

  test "dispatch commands on heartbeat expiration" do
    agent_id = Faker.UUID.v4()

    insert(:host, id: agent_id, heartbeat: :passing)
    %{timestamp: now} = insert(:heartbeat, agent_id: agent_id)

    expired_time =
      DateTime.add(
        now,
        Application.get_env(:trento, Heartbeats)[:interval] + 1,
        :millisecond
      )

    with_mock DateTime, [:passthrough], utc_now: fn -> expired_time end do
      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn command ->
          assert %UpdateHeartbeat{
                   host_id: ^agent_id,
                   heartbeat: :critical
                 } = command

          :ok
        end
      )

      Heartbeats.dispatch_heartbeat_failed_commands()
    end
  end
end
