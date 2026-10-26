defmodule Trento.Infrastructure.Commanded.EventHandlers.ScheduledRunsEventHandlerTest do
  use ExUnit.Case, async: true
  use Trento.DataCase
  use Trento.CommandedCase

  import Mox
  import Trento.Factory

  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.Infrastructure.Commanded.EventHandlers.ScheduledRunsEventHandler
  alias Trento.Infrastructure.Messaging.Adapter.Mock, as: Messaging
  alias Trento.Operations.Commands.CompleteScheduledRun
  alias Trento.Operations.Events.ScheduledRunStarted
  alias Trento.Operations.OperationSchedule
  alias Trento.Support.DateService

  setup :verify_on_exit!

  @run_at ~U[2026-11-07 02:00:00.000000Z]

  setup do
    %{id: host_id} = insert(:host, heartbeat: :passing, cluster_id: nil)

    %{id: schedule_id} =
      Repo.insert!(%OperationSchedule{
        target_type: "host",
        target_id: host_id,
        operation: "reboot",
        starts_at: @run_at,
        timezone: "Etc/UTC",
        next_run_at: @run_at
      })

    %{schedule_id: schedule_id}
  end

  defp started(schedule_id),
    do: %ScheduledRunStarted{schedule_id: schedule_id, run_at: @run_at, started_at: @run_at}

  defp at(now), do: stub(DateService.Mock, :utc_now, fn -> now end)

  defp expect_completion(schedule_id, fun) do
    expect(Trento.Commanded.Mock, :dispatch, fn %CompleteScheduledRun{schedule_id: ^schedule_id} =
                                                  command,
                                                opts ->
      assert schedule_id == Keyword.fetch!(opts, :correlation_id)
      fun.(command)
      :ok
    end)
  end

  test "should request the operation and record it", %{schedule_id: schedule_id} do
    at(DateTime.add(@run_at, 30, :second))
    expect(Messaging, :publish, fn _, "requests", _ -> :ok end)

    expect_completion(schedule_id, fn command ->
      assert %CompleteScheduledRun{outcome: :requested, operation_id: operation_id} = command
      assert {:ok, _} = UUID.info(operation_id)
    end)

    assert :ok ==
             ScheduledRunsEventHandler.handle(started(schedule_id), %{
               date_service: DateService.Mock
             })
  end

  test "should record the failing policies", %{schedule_id: schedule_id} do
    at(DateTime.add(@run_at, 30, :second))
    Repo.update_all(HostReadModel, set: [heartbeat: :critical])
    expect(Messaging, :publish, 0, fn _, _, _ -> :ok end)

    expect_completion(schedule_id, fn command ->
      assert %CompleteScheduledRun{outcome: :failed, reason: "policies", errors: [_]} = command
    end)

    assert :ok ==
             ScheduledRunsEventHandler.handle(started(schedule_id), %{
               date_service: DateService.Mock
             })
  end

  test "should not request an occurrence later than the grace period", %{schedule_id: schedule_id} do
    at(DateTime.add(@run_at, 10, :minute))
    expect(Messaging, :publish, 0, fn _, _, _ -> :ok end)

    expect_completion(schedule_id, fn command ->
      assert %CompleteScheduledRun{outcome: :failed, reason: "not_available"} = command
    end)

    assert :ok ==
             ScheduledRunsEventHandler.handle(started(schedule_id), %{
               date_service: DateService.Mock
             })
  end

  test "should retry a request that cannot be sent until the grace period ends", %{
    schedule_id: schedule_id
  } do
    at(DateTime.add(@run_at, 30, :second))
    expect(Messaging, :publish, fn _, "requests", _ -> {:error, :closed} end)
    event = started(schedule_id)

    assert {:error, :closed} ==
             ScheduledRunsEventHandler.handle(event, %{date_service: DateService.Mock})

    failure = %Commanded.Event.FailureContext{
      context: %{},
      metadata: %{date_service: DateService.Mock}
    }

    assert {:retry, 60_000, _} =
             ScheduledRunsEventHandler.error({:error, :closed}, event, failure)

    at(DateTime.add(@run_at, 6, :minute))

    expect_completion(schedule_id, fn command ->
      assert %CompleteScheduledRun{outcome: :failed, reason: "not_available"} = command
    end)

    assert :skip == ScheduledRunsEventHandler.error({:error, :closed}, event, failure)
  end

  test "should ignore the run of a schedule that is gone" do
    expect(Trento.Commanded.Mock, :dispatch, 0, fn _, _ -> :ok end)

    assert :ok ==
             ScheduledRunsEventHandler.handle(started(UUID.uuid4()), %{
               date_service: DateService.Mock
             })
  end
end
