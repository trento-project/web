defmodule Trento.Operations.SchedulesReadTest do
  use ExUnit.Case, async: true
  use Trento.DataCase

  import Mox
  import Trento.Factory

  alias Trento.Operations.{OperationSchedule, Schedules}
  alias Trento.Support.DateService

  setup do
    stub(DateService.Mock, :utc_now, fn -> ~U[2026-11-02 10:00:00.000000Z] end)
    %{id: host_id} = insert(:host, heartbeat: :passing, cluster_id: nil)
    %{host_id: host_id}
  end

  defp schedule!(host_id, starts_at) do
    {:ok, schedule, _} =
      Schedules.create_schedule(
        %{
          target_type: "host",
          target_id: host_id,
          operation: "reboot",
          starts_at: starts_at,
          timezone: "Etc/UTC"
        },
        "admin",
        DateService.Mock
      )

    schedule
  end

  test "should list the schedules of a target, the next one first", %{host_id: host_id} do
    %{id: later} = schedule!(host_id, ~U[2026-11-09 02:00:00.000000Z])
    %{id: sooner} = schedule!(host_id, ~U[2026-11-07 02:00:00.000000Z])

    %{id: other_host_id} = insert(:host, heartbeat: :passing, cluster_id: nil)
    schedule!(other_host_id, ~U[2026-11-05 02:00:00.000000Z])

    assert [%OperationSchedule{id: ^sooner}, %OperationSchedule{id: ^later}] =
             Schedules.list_schedules(host_id)
  end

  test "should return no schedules for a target without any" do
    assert [] == Schedules.list_schedules(UUID.uuid4())
  end

  test "should get a schedule by id", %{host_id: host_id} do
    %{id: schedule_id} = schedule!(host_id, ~U[2026-11-07 02:00:00.000000Z])

    assert {:ok, %OperationSchedule{id: ^schedule_id}} = Schedules.get_schedule(schedule_id)
    assert {:error, :not_found} == Schedules.get_schedule(UUID.uuid4())
  end
end
