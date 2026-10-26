defmodule Trento.Operations.ScheduledRunsIntegrationTest do
  use Trento.CommandedIntegrationCase

  import Mox
  import Trento.Factory
  import Trento.CommandedIntegrationCase, only: [eventually: 1]

  alias Trento.ActivityLog.ActivityLog
  alias Trento.Infrastructure.Messaging.Adapter.Mock, as: Messaging
  alias Trento.Operations.{OperationSchedule, Scheduler, Schedules}
  alias Trento.Repo
  alias Trento.Support.DateService

  setup :set_mox_global

  test "should run a due one-time schedule from start to end" do
    %{id: host_id} = insert(:host, heartbeat: :passing, cluster_id: nil)
    stub(DateService.Mock, :utc_now, fn -> ~U[2026-11-02 10:00:00.000000Z] end)

    {:ok, %{id: schedule_id}, _} =
      Schedules.create_schedule(
        %{
          target_type: "host",
          target_id: host_id,
          operation: "reboot",
          starts_at: ~U[2026-11-07 02:00:00.000000Z],
          timezone: "Etc/UTC"
        },
        "admin",
        DateService.Mock
      )

    expect(Messaging, :publish, fn _, "requests", _ -> :ok end)
    stub(DateService.Mock, :utc_now, fn -> ~U[2026-11-07 02:00:30.000000Z] end)

    :ok = Scheduler.run_due(DateService.Mock)

    assert %ActivityLog{
             actor: "system",
             metadata: %{"correlation_id" => ^schedule_id, "operation_id" => _}
           } =
             eventually(fn -> Repo.get_by(ActivityLog, type: "scheduled_operation_requested") end)

    assert eventually(fn -> is_nil(Repo.get(OperationSchedule, schedule_id)) end)
  end
end
