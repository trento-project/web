defmodule Trento.Operations.SchedulesBulkTest do
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

    entries =
      eventually(fn ->
        case Repo.all(from a in ActivityLog, where: a.type == "operation_scheduled") do
          [_, _] = entries -> entries
          _ -> nil
        end
      end)

    assert Enum.all?(entries, &match?(%{metadata: %{"bulk_id" => ^bulk_id}}, &1))
  end

  test "should schedule nothing when a target is unknown or the schedule is not valid" do
    %{id: host_id} = insert(:host, heartbeat: :passing, cluster_id: nil)

    assert {:error, :not_found} =
             Schedules.create_bulk_schedules(
               attrs([host_id, UUID.uuid4()]),
               "admin",
               DateService.Mock
             )

    assert {:error, %Ecto.Changeset{}} =
             Schedules.create_bulk_schedules(
               Map.put(attrs([host_id]), :starts_at, ~U[2026-11-01 02:00:00.000000Z]),
               "admin",
               DateService.Mock
             )

    assert [] == Repo.all(OperationSchedule)
  end
end
