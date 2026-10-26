defmodule Trento.Operations.SchedulesCreateTest do
  use Trento.CommandedIntegrationCase

  import Mox
  import Trento.Factory
  import Trento.CommandedIntegrationCase, only: [eventually: 1]

  alias Trento.ActivityLog.ActivityLog
  alias Trento.Operations.{OperationSchedule, Schedules}
  alias Trento.Repo
  alias Trento.Support.DateService

  setup :set_mox_global

  @now ~U[2026-11-02 10:00:00.000000Z]

  setup do
    stub(DateService.Mock, :utc_now, fn -> @now end)
    %{id: host_id} = insert(:host, heartbeat: :passing, cluster_id: nil)
    %{host_id: host_id}
  end

  defp attrs(host_id, overrides \\ %{}) do
    Map.merge(
      %{
        target_type: "host",
        target_id: host_id,
        operation: "reboot",
        params: %{},
        starts_at: ~U[2026-11-07 02:00:00.000000Z],
        timezone: "Europe/Berlin",
        recurrence: nil
      },
      overrides
    )
  end

  test "should schedule an operation and answer with the projected schedule", %{host_id: host_id} do
    assert {:ok, %OperationSchedule{id: schedule_id} = schedule, []} =
             Schedules.create_schedule(
               attrs(host_id, %{recurrence: %{frequency: "weekly", interval: 1, weekdays: [1]}}),
               "admin",
               DateService.Mock
             )

    assert %OperationSchedule{
             target_id: ^host_id,
             frequency: "weekly",
             next_run_at: ~U[2026-11-09 02:00:00.000000Z],
             created_by: "admin"
           } = schedule

    assert %OperationSchedule{} = Repo.get!(OperationSchedule, schedule_id)
  end

  test "should log the schedule from its event", %{host_id: host_id} do
    {:ok, %{id: schedule_id}, _} =
      Schedules.create_schedule(attrs(host_id), "admin", DateService.Mock)

    assert %ActivityLog{
             actor: "admin",
             metadata: %{
               "schedule_id" => ^schedule_id,
               "correlation_id" => ^schedule_id,
               "target_id" => ^host_id,
               "operation" => "reboot"
             }
           } = eventually(fn -> Repo.get_by(ActivityLog, type: "operation_scheduled") end)
  end

  test "should return the policies that fail now as warnings" do
    %{id: host_id} = insert(:host, heartbeat: :critical, cluster_id: nil)

    assert {:ok, %OperationSchedule{},
            [%{message: "Trento agent is not currently running in the host"}]} =
             Schedules.create_schedule(attrs(host_id), "admin", DateService.Mock)
  end

  test "should not schedule an operation on an unknown target or an invalid schedule", %{
    host_id: host_id
  } do
    assert {:error, :not_found} ==
             Schedules.create_schedule(attrs(UUID.uuid4()), "admin", DateService.Mock)

    assert {:error, %Ecto.Changeset{}} =
             Schedules.create_schedule(
               attrs(host_id, %{starts_at: ~U[2026-11-01 02:00:00.000000Z]}),
               "admin",
               DateService.Mock
             )

    assert [] == Repo.all(OperationSchedule)
  end
end
