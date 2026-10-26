defmodule Trento.Operations.SchedulesChangeTest do
  use Trento.CommandedIntegrationCase

  import Mox
  import Trento.Factory
  import Trento.CommandedIntegrationCase, only: [eventually: 1]

  alias Trento.ActivityLog.ActivityLog
  alias Trento.Operations.{OperationSchedule, Schedules}
  alias Trento.Repo
  alias Trento.Support.DateService

  setup :set_mox_global

  setup do
    stub(DateService.Mock, :utc_now, fn -> ~U[2026-11-02 10:00:00.000000Z] end)
    %{id: host_id} = insert(:host, heartbeat: :passing, cluster_id: nil)

    {:ok, schedule, _} =
      Schedules.create_schedule(
        %{
          target_type: "host",
          target_id: host_id,
          operation: "reboot",
          starts_at: ~U[2026-11-07 02:00:00.000000Z],
          timezone: "Etc/UTC",
          recurrence: %{frequency: "daily", interval: 1}
        },
        "admin",
        DateService.Mock
      )

    %{schedule: schedule}
  end

  test "should change a schedule and log it", %{schedule: %{id: schedule_id}} do
    assert {:ok,
            %OperationSchedule{
              id: ^schedule_id,
              frequency: nil,
              next_run_at: ~U[2026-11-10 04:00:00.000000Z],
              created_by: "admin"
            }, []} =
             Schedules.update_schedule(
               schedule_id,
               %{
                 starts_at: ~U[2026-11-10 04:00:00.000000Z],
                 timezone: "Etc/UTC",
                 recurrence: nil
               },
               "operator",
               DateService.Mock
             )

    assert %ActivityLog{actor: "operator", metadata: %{"correlation_id" => ^schedule_id}} =
             eventually(fn -> Repo.get_by(ActivityLog, type: "operation_schedule_changed") end)
  end

  test "should refuse an invalid change and an unknown schedule", %{
    schedule: %{id: schedule_id}
  } do
    assert {:error, %Ecto.Changeset{}} =
             Schedules.update_schedule(
               schedule_id,
               %{starts_at: ~U[2026-11-01 04:00:00.000000Z], timezone: "Etc/UTC"},
               "operator",
               DateService.Mock
             )

    assert {:error, :not_found} ==
             Schedules.update_schedule(
               UUID.uuid4(),
               %{starts_at: ~U[2026-11-10 04:00:00.000000Z], timezone: "Etc/UTC"},
               "operator",
               DateService.Mock
             )
  end
end
