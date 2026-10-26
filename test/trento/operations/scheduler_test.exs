defmodule Trento.Operations.SchedulerTest do
  use ExUnit.Case, async: true
  use Trento.DataCase
  use Oban.Testing, repo: Trento.Repo

  import Mox
  import Trento.Factory

  alias Trento.ActivityLog.ActivityLog
  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.Infrastructure.Jobs.ScheduledOperationJob
  alias Trento.Infrastructure.Messaging.Adapter.Mock, as: Messaging
  alias Trento.Operations.{OperationSchedule, ScheduleJobs, Scheduler, Schedules}
  alias Trento.Support.DateService

  setup :verify_on_exit!

  @created_at ~U[2026-11-02 10:00:00.000000Z]
  @starts_at ~U[2026-11-07 02:00:00.000000Z]

  setup do
    %{id: host_id} = insert(:host, heartbeat: :passing, cluster_id: nil)
    %{host_id: host_id}
  end

  defp schedule!(host_id, recurrence \\ nil) do
    stub(DateService.Mock, :utc_now, fn -> @created_at end)

    {:ok, schedule, _} =
      Schedules.create_schedule(
        %{
          target_type: "host",
          target_id: host_id,
          operation: "reboot",
          starts_at: @starts_at,
          timezone: "Etc/UTC",
          recurrence: recurrence
        },
        "admin",
        DateService.Mock
      )

    schedule
  end

  defp run_at(%{id: schedule_id}, now, run_at \\ @starts_at) do
    stub(DateService.Mock, :utc_now, fn -> now end)
    Scheduler.run(schedule_id, run_at, DateService.Mock)
  end

  defp entries(type), do: Enum.filter(Repo.all(ActivityLog), &(&1.type == type))

  defp pending_jobs,
    do:
      Repo.all(
        from j in Oban.Job,
          where: j.worker == ^ScheduleJobs.worker() and j.state in ["scheduled", "available"]
      )

  test "should request a due one-time operation and remove the schedule", %{host_id: host_id} do
    %{id: schedule_id} = schedule = schedule!(host_id)
    expect(Messaging, :publish, fn _, "requests", _ -> :ok end)

    assert :ok == run_at(schedule, DateTime.add(@starts_at, 30, :second))

    assert [] == Repo.all(OperationSchedule)

    assert [
             %ActivityLog{
               actor: "system",
               metadata: %{
                 "schedule_id" => ^schedule_id,
                 "operation_id" => _,
                 "run_at" => "2026-11-07T02:00:00.000000Z"
               }
             }
           ] = entries("scheduled_operation_requested")
  end

  test "should enqueue the job of the next occurrence", %{host_id: host_id} do
    %{id: schedule_id} = schedule = schedule!(host_id, %{frequency: "daily", interval: 2})
    expect(Messaging, :publish, fn _, "requests", _ -> :ok end)
    Repo.update_all(Oban.Job, set: [state: "completed"])

    assert :ok == run_at(schedule, DateTime.add(@starts_at, 30, :second))

    assert %OperationSchedule{next_run_at: ~U[2026-11-09 02:00:00.000000Z], occurrences: 1} =
             Repo.get!(OperationSchedule, schedule_id)

    assert [%Oban.Job{scheduled_at: ~U[2026-11-09 02:00:00.000000Z]}] = pending_jobs()
  end

  test "should end a periodic schedule after its last occurrence", %{host_id: host_id} do
    schedule = schedule!(host_id, %{frequency: "daily", interval: 1, max_occurrences: 1})
    expect(Messaging, :publish, fn _, "requests", _ -> :ok end)
    Repo.update_all(Oban.Job, set: [state: "completed"])

    assert :ok == run_at(schedule, DateTime.add(@starts_at, 30, :second))

    assert [] == Repo.all(OperationSchedule)
    assert [] == pending_jobs()
  end

  test "should not request an operation whose policies fail", %{host_id: host_id} do
    schedule = schedule!(host_id, %{frequency: "daily", interval: 1})
    Repo.update_all(HostReadModel, set: [heartbeat: :critical])
    expect(Messaging, :publish, 0, fn _, _, _ -> :ok end)

    assert :ok == run_at(schedule, DateTime.add(@starts_at, 30, :second))

    assert [%ActivityLog{metadata: %{"reason" => "policies"}}] =
             entries("scheduled_operation_request_failed")
  end

  test "should not run an occurrence late when Trento was not available", %{host_id: host_id} do
    %{id: schedule_id} = schedule = schedule!(host_id, %{frequency: "daily", interval: 1})
    expect(Messaging, :publish, 0, fn _, _, _ -> :ok end)

    assert :ok == run_at(schedule, ~U[2026-11-10 01:00:00.000000Z])

    assert [%ActivityLog{metadata: %{"reason" => "not_available"}}] =
             entries("scheduled_operation_request_failed")

    assert %OperationSchedule{next_run_at: ~U[2026-11-10 02:00:00.000000Z]} =
             Repo.get!(OperationSchedule, schedule_id)
  end

  test "should snooze a request that cannot be sent until the grace period ends", %{
    host_id: host_id
  } do
    %{id: schedule_id} = schedule = schedule!(host_id)
    expect(Messaging, :publish, fn _, "requests", _ -> {:error, :closed} end)

    assert {:snooze, 60} == run_at(schedule, DateTime.add(@starts_at, 60, :second))
    assert %OperationSchedule{next_run_at: @starts_at} = Repo.get!(OperationSchedule, schedule_id)

    assert :ok == run_at(schedule, DateTime.add(@starts_at, 6, :minute))

    assert [%ActivityLog{metadata: %{"reason" => "not_available"}}] =
             entries("scheduled_operation_request_failed")
  end

  test "should ignore the job of an occurrence the schedule moved away from", %{host_id: host_id} do
    schedule = schedule!(host_id)
    expect(Messaging, :publish, 0, fn _, _, _ -> :ok end)

    assert :ok ==
             run_at(
               schedule,
               DateTime.add(@starts_at, 30, :second),
               ~U[2026-11-06 02:00:00.000000Z]
             )

    assert [%OperationSchedule{occurrences: 0}] = Repo.all(OperationSchedule)
  end

  test "the job runs its schedule", %{host_id: host_id} do
    %{id: schedule_id} = schedule!(host_id)
    expect(Messaging, :publish, fn _, "requests", _ -> :ok end)

    assert :ok =
             perform_job(ScheduledOperationJob, %{
               schedule_id: schedule_id,
               run_at: "2026-11-07T02:00:00.000000Z"
             })

    assert [_] = entries("scheduled_operation_requested")
  end
end
