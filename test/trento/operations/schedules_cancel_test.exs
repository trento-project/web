defmodule Trento.Operations.SchedulesCancelTest do
  use Trento.CommandedIntegrationCase

  import Ecto.Query, only: [from: 2]
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
    %{host_id: host_id}
  end

  defp schedule!(host_id) do
    {:ok, schedule, _} =
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

    schedule
  end

  test "should cancel a schedule and log it", %{host_id: host_id} do
    %{id: schedule_id} = schedule!(host_id)

    assert :ok == Schedules.cancel_schedule(schedule_id, "operator")
    assert {:error, :not_found} == Schedules.get_schedule(schedule_id)

    assert %ActivityLog{actor: "operator", metadata: %{"correlation_id" => ^schedule_id}} =
             eventually(fn -> Repo.get_by(ActivityLog, type: "operation_schedule_cancelled") end)

    assert {:error, :not_found} == Schedules.cancel_schedule(schedule_id, "operator")
  end

  test "should cancel the schedules of a removed target, correlated to the clean up", %{
    host_id: host_id
  } do
    schedule!(host_id)
    schedule!(host_id)
    cleanup_correlation_id = UUID.uuid4()

    assert :ok == Schedules.cancel_target_schedules(host_id, cleanup_correlation_id)
    assert [] == Repo.all(OperationSchedule)

    entries =
      eventually(fn ->
        case Repo.all(from a in ActivityLog, where: a.type == "operation_schedule_cancelled") do
          [_, _] = entries -> entries
          _ -> nil
        end
      end)

    assert Enum.all?(
             entries,
             &match?(
               %ActivityLog{
                 actor: "system",
                 metadata: %{"correlation_id" => ^cleanup_correlation_id}
               },
               &1
             )
           )
  end
end
