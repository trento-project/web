defmodule Trento.Operations.SchedulesBulkTest do
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
    :ok
  end

  defp attrs(target_ids) do
    %{
      target_type: "host",
      target_ids: target_ids,
      operation: "reboot",
      params: %{},
      starts_at: ~U[2026-11-07 02:00:00.000000Z],
      timezone: "Etc/UTC",
      recurrence: %{frequency: "monthly", interval: 1}
    }
  end

  test "should create one schedule per target with the same bulk id" do
    %{id: passing} = insert(:host, heartbeat: :passing, cluster_id: nil)
    %{id: critical} = insert(:host, heartbeat: :critical, cluster_id: nil)

    assert {:ok, bulk_id, results} =
             Schedules.create_bulk_schedules(
               attrs([passing, critical]),
               "admin",
               DateService.Mock
             )

    assert [
             {%OperationSchedule{target_id: ^passing, bulk_id: ^bulk_id, frequency: "monthly"},
              []},
             {%OperationSchedule{target_id: ^critical, bulk_id: ^bulk_id},
              [%{message: "Trento agent is not currently running in the host"}]}
           ] = results

    assert 2 == length(all_enqueued(worker: Trento.Operations.ScheduleJobs.worker()))

    entries = Repo.all(ActivityLog)
    assert 2 == length(entries)

    assert Enum.all?(
             entries,
             &match?(%{type: "operation_scheduled", metadata: %{"bulk_id" => ^bulk_id}}, &1)
           )
  end

  test "should schedule nothing when a target is unknown" do
    %{id: host_id} = insert(:host, heartbeat: :passing, cluster_id: nil)

    assert {:error, :not_found} =
             Schedules.create_bulk_schedules(
               attrs([host_id, UUID.uuid4()]),
               "admin",
               DateService.Mock
             )

    assert [] == Repo.all(OperationSchedule)
    assert [] == Repo.all(ActivityLog)
  end

  test "should schedule nothing when the schedule is not valid" do
    %{id: host_id} = insert(:host, heartbeat: :passing, cluster_id: nil)

    assert {:error, %Ecto.Changeset{errors: [starts_at: _]}} =
             Schedules.create_bulk_schedules(
               Map.put(attrs([host_id]), :starts_at, ~U[2026-11-01 02:00:00.000000Z]),
               "admin",
               DateService.Mock
             )

    assert [] == Repo.all(OperationSchedule)
  end
end
