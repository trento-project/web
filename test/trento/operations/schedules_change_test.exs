defmodule Trento.Operations.SchedulesChangeTest do
  use ExUnit.Case, async: true
  use Trento.DataCase

  import Mox
  import Trento.Factory

  alias Trento.ActivityLog.ActivityLog
  alias Trento.Operations.{OperationSchedule, Schedules}
  alias Trento.Repo
  alias Trento.Support.DateService

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
          recurrence: %{frequency: "daily", interval: 1, max_occurrences: 3}
        },
        "admin",
        DateService.Mock
      )

    Repo.update_all(OperationSchedule, set: [occurrences: 2])

    %{schedule: schedule}
  end

  test "should replace when the operation runs and restart the occurrences", %{
    schedule: %{id: schedule_id}
  } do
    assert {:ok, schedule, []} =
             Schedules.update_schedule(
               schedule_id,
               %{
                 starts_at: ~U[2026-11-10 04:00:00.000000Z],
                 timezone: "Europe/Berlin",
                 recurrence: nil
               },
               "operator",
               DateService.Mock
             )

    assert %OperationSchedule{
             id: ^schedule_id,
             frequency: nil,
             max_occurrences: nil,
             next_run_at: ~U[2026-11-10 04:00:00.000000Z],
             occurrences: 0,
             created_by: "admin"
           } = schedule
  end

  test "should log the change", %{schedule: %{id: schedule_id}} do
    {:ok, _, _} =
      Schedules.update_schedule(
        schedule_id,
        %{starts_at: ~U[2026-11-10 04:00:00.000000Z], timezone: "Etc/UTC"},
        "operator",
        DateService.Mock
      )

    assert %ActivityLog{
             actor: "operator",
             metadata: %{
               "correlation_id" => ^schedule_id,
               "next_run_at" => "2026-11-10T04:00:00.000000Z"
             }
           } = Repo.get_by!(ActivityLog, type: "operation_schedule_changed")
  end

  test "should return the policies that fail now", %{schedule: %{id: schedule_id}} do
    Repo.update_all(Trento.Hosts.Projections.HostReadModel, set: [heartbeat: :critical])

    assert {:ok, _, [%{message: "Trento agent is not currently running in the host"}]} =
             Schedules.update_schedule(
               schedule_id,
               %{starts_at: ~U[2026-11-10 04:00:00.000000Z], timezone: "Etc/UTC"},
               "operator",
               DateService.Mock
             )
  end

  test "should refuse an invalid change", %{schedule: %{id: schedule_id}} do
    assert {:error, %Ecto.Changeset{errors: [starts_at: _]}} =
             Schedules.update_schedule(
               schedule_id,
               %{starts_at: ~U[2026-11-01 04:00:00.000000Z], timezone: "Etc/UTC"},
               "operator",
               DateService.Mock
             )

    assert {:ok, %OperationSchedule{next_run_at: ~U[2026-11-07 02:00:00.000000Z]}} =
             Schedules.get_schedule(schedule_id)
  end

  test "should not find an unknown schedule" do
    assert {:error, :not_found} ==
             Schedules.update_schedule(
               UUID.uuid4(),
               %{starts_at: ~U[2026-11-10 04:00:00.000000Z], timezone: "Etc/UTC"},
               "operator",
               DateService.Mock
             )
  end
end
