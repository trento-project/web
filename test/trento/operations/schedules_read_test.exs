defmodule Trento.Operations.SchedulesReadTest do
  use ExUnit.Case, async: true
  use Trento.DataCase

  alias Trento.Operations.{OperationSchedule, Schedules}

  defp schedule!(target_id, next_run_at) do
    Repo.insert!(%OperationSchedule{
      target_type: "host",
      target_id: target_id,
      operation: "reboot",
      starts_at: next_run_at,
      timezone: "Etc/UTC",
      next_run_at: next_run_at,
      created_by: "admin"
    })
  end

  test "should list the schedules of a target, the next one first" do
    host_id = UUID.uuid4()
    %{id: later} = schedule!(host_id, ~U[2026-11-09 02:00:00.000000Z])
    %{id: sooner} = schedule!(host_id, ~U[2026-11-07 02:00:00.000000Z])
    schedule!(UUID.uuid4(), ~U[2026-11-05 02:00:00.000000Z])

    assert [%OperationSchedule{id: ^sooner}, %OperationSchedule{id: ^later}] =
             Schedules.list_schedules(host_id)
  end

  test "should return no schedules for a target without any" do
    assert [] == Schedules.list_schedules(UUID.uuid4())
  end

  test "should get a schedule by id" do
    %{id: schedule_id} = schedule!(UUID.uuid4(), ~U[2026-11-07 02:00:00.000000Z])

    assert {:ok, %OperationSchedule{id: ^schedule_id}} = Schedules.get_schedule(schedule_id)
    assert {:error, :not_found} == Schedules.get_schedule(UUID.uuid4())
  end
end
