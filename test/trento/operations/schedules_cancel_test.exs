defmodule Trento.Operations.SchedulesCancelTest do
  use ExUnit.Case, async: true
  use Trento.DataCase
  use Oban.Testing, repo: Trento.Repo

  import Mox
  import Trento.Factory

  alias Trento.ActivityLog.ActivityLog
  alias Trento.Operations.{OperationSchedule, Schedules}
  alias Trento.Support.DateService

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

    assert %ActivityLog{
             actor: "operator",
             metadata: %{"correlation_id" => ^schedule_id, "target_id" => ^host_id}
           } = Repo.get_by!(ActivityLog, type: "operation_schedule_cancelled")
  end

  test "should cancel the job of a cancelled schedule", %{host_id: host_id} do
    %{id: schedule_id} = schedule!(host_id)
    %{id: removed_with_target} = schedule!(host_id)

    :ok = Schedules.cancel_schedule(schedule_id, "operator")
    :ok = Schedules.cancel_target_schedules(host_id, nil)

    refute_enqueued(worker: Trento.Operations.ScheduleJobs.worker())

    assert [schedule_id, removed_with_target] |> Enum.sort() ==
             Repo.all(
               from j in Oban.Job, where: j.state == "cancelled", select: j.args["schedule_id"]
             )
             |> Enum.sort()
  end

  test "should not find an unknown schedule" do
    assert {:error, :not_found} == Schedules.cancel_schedule(UUID.uuid4(), "operator")
  end

  test "should cancel the schedules of a removed target, correlated to the clean up", %{
    host_id: host_id
  } do
    %{id: first} = schedule!(host_id)
    %{id: second} = schedule!(host_id)
    %{id: other_host_id} = insert(:host, heartbeat: :passing, cluster_id: nil)
    %{id: kept} = schedule!(other_host_id)
    cleanup_correlation_id = UUID.uuid4()

    assert :ok == Schedules.cancel_target_schedules(host_id, cleanup_correlation_id)

    assert [%OperationSchedule{id: ^kept}] = Repo.all(OperationSchedule)

    cancelled =
      ActivityLog
      |> Repo.all()
      |> Enum.filter(&(&1.type == "operation_schedule_cancelled"))

    assert [first, second] |> Enum.sort() ==
             cancelled |> Enum.map(& &1.metadata["schedule_id"]) |> Enum.sort()

    assert Enum.all?(
             cancelled,
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
