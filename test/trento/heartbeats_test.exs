defmodule Trento.HeartbeatsTest do
  use ExUnit.Case
  use Trento.DataCase

  import Mox

  import Trento.Factory

  alias Trento.ActivityLog
  alias Trento.Heartbeats
  alias Trento.Heartbeats.Heartbeat

  alias Trento.Hosts.Commands.UpdateHeartbeat

  alias Trento.Repo

  @moduletag :integration

  setup [:set_mox_from_context, :verify_on_exit!]

  for scenario <- [:with_correlation, :without_correlation] do
    @scenario scenario

    describe "#{@scenario}" do
      test "create new heartbeat scenario: #{@scenario}" do
        now = DateTime.utc_now()
        agent_id = Faker.UUID.v4()

        expect(
          Trento.Support.DateService.Mock,
          :utc_now,
          fn -> now end
        )

        scenario_setup(@scenario, agent_id, :passing)

        Heartbeats.heartbeat(agent_id, Trento.Support.DateService.Mock)

        [heartbeat] = Repo.all(Heartbeat)

        assert heartbeat.agent_id == agent_id
        assert heartbeat.timestamp == now
      end

      test "update existing heartbeat scenario: #{@scenario}" do
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

        scenario_setup(@scenario, agent_id, :passing)

        Heartbeats.heartbeat(agent_id, Trento.Support.DateService.Mock)

        [heartbeat] = Repo.all(Heartbeat)

        assert heartbeat.timestamp == updated_time
      end

      test "dispatch commands on heartbeat expiration scenario:#{@scenario}" do
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

        scenario_setup(@scenario, agent_id, :critical)
        Heartbeats.dispatch_heartbeat_failed_commands(Trento.Support.DateService.Mock)
      end

      test "filter deregistered hosts from heartbeat failed check scenario: #{@scenario}" do
        %{id: agent_id} = insert(:host, heartbeat: :passing, deregistered_at: DateTime.utc_now())
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
          0,
          fn _ -> :ok end
        )

        Heartbeats.dispatch_heartbeat_failed_commands(Trento.Support.DateService.Mock)
      end
    end
  end

  defp scenario_setup(:with_correlation, agent_id, health) do
    correlation_id = UUID.uuid4()
    key0 = UUID.uuid4()
    Process.put(:correlation_key, key0)
    key = ActivityLog.correlation_key(:api_key)
    ActivityLog.put_correlation_id(key, correlation_id)

    expect(
      Trento.Commanded.Mock,
      :dispatch,
      fn
        command, [correlation_id: ^correlation_id, causation_id: causation_id] ->
          assert correlation_id == causation_id

          assert %UpdateHeartbeat{
                   host_id: ^agent_id,
                   heartbeat: ^health
                 } = command

          :ok
      end
    )
  end

  defp scenario_setup(:without_correlation, agent_id, health) do
    expect(
      Trento.Commanded.Mock,
      :dispatch,
      fn
        command ->
          assert %UpdateHeartbeat{
                   host_id: ^agent_id,
                   heartbeat: ^health
                 } = command

          :ok
      end
    )

    :ok
  end
end
