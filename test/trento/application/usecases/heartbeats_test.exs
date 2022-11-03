defmodule Trento.HeartbeatsTest do
  use ExUnit.Case
  use Trento.DataCase

  import Mox

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

    expect(
      Trento.Support.DateService.Mock,
      :utc_now,
      fn -> now end
    )

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

    Heartbeats.heartbeat(agent_id, Trento.Support.DateService.Mock)

    [heartbeat] = Repo.all(Heartbeat)

    assert heartbeat.agent_id == agent_id
    assert heartbeat.timestamp == now
  end

  test "update existing heartbeat" do
    %{id: agent_id} = insert(:host, heartbeat: :critical)
    %{timestamp: now} = insert(:heartbeat, agent_id: agent_id)

    updated_time =
      DateTime.add(
        now,
        Application.get_env(:trento, Heartbeats)[:interval] + 1,
        :millisecond
      )

    expect(
      Trento.Support.DateService.Mock,
      :utc_now,
      fn -> updated_time end
    )

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

    Heartbeats.heartbeat(agent_id, Trento.Support.DateService.Mock)

    [heartbeat] = Repo.all(Heartbeat)

    assert heartbeat.timestamp == updated_time
  end

  test "dispatch commands on heartbeat expiration" do
    %{id: agent_id} = insert(:host, heartbeat: :passing)
    %{timestamp: now} = insert(:heartbeat, agent_id: agent_id)

    expired_time =
      DateTime.add(
        now,
        Application.get_env(:trento, Heartbeats)[:interval] + 1,
        :millisecond
      )

    expect(
      Trento.Support.DateService.Mock,
      :utc_now,
      fn -> expired_time end
    )

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

    Heartbeats.dispatch_heartbeat_failed_commands(Trento.Support.DateService.Mock)
  end
end
