defmodule Trento.Operations.ScheduleRunsTest do
  use Trento.AggregateCase, aggregate: Trento.Operations.Schedule, async: true

  alias Trento.Operations.Commands.{
    ChangeOperationSchedule,
    CompleteScheduledRun,
    StartScheduledRun
  }

  alias Trento.Operations.Events.{
    OperationScheduled,
    ScheduledOperationRequested,
    ScheduledOperationRequestFailed,
    ScheduledRunStarted
  }

  alias Trento.Operations.Schedule

  @run_at ~U[2026-11-07 02:00:00.000000Z]

  defp scheduled(schedule_id, recurrence) do
    %OperationScheduled{
      schedule_id: schedule_id,
      target_type: "host",
      target_id: "0a7a5d13-0e6e-4ac4-9f76-6b2d9d6a1b5e",
      operation: "reboot",
      params: %{},
      starts_at: @run_at,
      timezone: "Etc/UTC",
      recurrence: recurrence,
      next_run_at: @run_at,
      actor: "admin"
    }
  end

  defp started(schedule_id),
    do: %ScheduledRunStarted{schedule_id: schedule_id, run_at: @run_at, started_at: @run_at}

  test "should start the run of the next occurrence once" do
    schedule_id = UUID.uuid4()

    command =
      StartScheduledRun.new!(%{schedule_id: schedule_id, run_at: @run_at, started_at: @run_at})

    assert_events([scheduled(schedule_id, nil)], command, [started(schedule_id)])

    assert_error(
      [scheduled(schedule_id, nil), started(schedule_id)],
      command,
      {:error, :run_in_progress}
    )
  end

  test "should not start a run that is not the next occurrence" do
    schedule_id = UUID.uuid4()

    assert_error(
      [scheduled(schedule_id, nil)],
      StartScheduledRun.new!(%{
        schedule_id: schedule_id,
        run_at: ~U[2026-11-06 02:00:00.000000Z],
        started_at: @run_at
      }),
      {:error, :stale_run}
    )
  end

  test "should record a requested occurrence and move to the next one" do
    schedule_id = UUID.uuid4()
    operation_id = UUID.uuid4()

    assert_events_and_state(
      [scheduled(schedule_id, %{"frequency" => "daily", "interval" => 2}), started(schedule_id)],
      CompleteScheduledRun.new!(%{
        schedule_id: schedule_id,
        run_at: @run_at,
        outcome: "requested",
        operation_id: operation_id,
        completed_at: @run_at
      }),
      [
        %ScheduledOperationRequested{
          schedule_id: schedule_id,
          target_type: "host",
          target_id: "0a7a5d13-0e6e-4ac4-9f76-6b2d9d6a1b5e",
          operation: "reboot",
          params: %{},
          starts_at: @run_at,
          timezone: "Etc/UTC",
          recurrence: %{"frequency" => "daily", "interval" => 2},
          bulk_id: nil,
          actor: "system",
          run_at: @run_at,
          operation_id: operation_id,
          occurrences: 1,
          next_run_at: ~U[2026-11-09 02:00:00.000000Z]
        }
      ],
      fn state ->
        assert %Schedule{next_run_at: ~U[2026-11-09 02:00:00.000000Z], occurrences: 1} = state
      end
    )
  end

  test "should end a one-time schedule after its run, whatever the outcome" do
    schedule_id = UUID.uuid4()
    initial = [scheduled(schedule_id, nil), started(schedule_id)]

    assert_events(
      initial,
      CompleteScheduledRun.new!(%{
        schedule_id: schedule_id,
        run_at: @run_at,
        outcome: "failed",
        reason: "policies",
        errors: [%{message: "Trento agent is not currently running in the host", metadata: []}],
        completed_at: @run_at
      }),
      [
        %ScheduledOperationRequestFailed{
          schedule_id: schedule_id,
          target_type: "host",
          target_id: "0a7a5d13-0e6e-4ac4-9f76-6b2d9d6a1b5e",
          operation: "reboot",
          params: %{},
          starts_at: @run_at,
          timezone: "Etc/UTC",
          recurrence: nil,
          bulk_id: nil,
          actor: "system",
          run_at: @run_at,
          reason: "policies",
          errors: [%{message: "Trento agent is not currently running in the host", metadata: []}],
          occurrences: 1,
          next_run_at: nil
        }
      ]
    )

    ended =
      initial ++
        [
          %ScheduledOperationRequestFailed{
            schedule_id: schedule_id,
            run_at: @run_at,
            next_run_at: nil,
            occurrences: 1
          }
        ]

    assert_error(
      ended,
      ChangeOperationSchedule.new!(%{
        schedule_id: schedule_id,
        starts_at: ~U[2026-11-10 04:00:00.000000Z],
        timezone: "Etc/UTC",
        next_run_at: ~U[2026-11-10 04:00:00.000000Z],
        actor: "operator"
      }),
      {:error, :operation_schedule_not_found}
    )
  end

  test "should move a late occurrence to the next one after its completion" do
    schedule_id = UUID.uuid4()

    assert {:ok, _, events} =
             aggregate_run(
               [
                 scheduled(schedule_id, %{"frequency" => "daily", "interval" => 1}),
                 started(schedule_id)
               ],
               CompleteScheduledRun.new!(%{
                 schedule_id: schedule_id,
                 run_at: @run_at,
                 outcome: "failed",
                 reason: "not_available",
                 completed_at: ~U[2026-11-10 01:00:00.000000Z]
               })
             )

    assert [%ScheduledOperationRequestFailed{next_run_at: ~U[2026-11-10 02:00:00.000000Z]}] =
             List.wrap(events)
  end

  test "should not complete a run that was not started" do
    schedule_id = UUID.uuid4()

    assert_error(
      [scheduled(schedule_id, nil)],
      CompleteScheduledRun.new!(%{
        schedule_id: schedule_id,
        run_at: @run_at,
        outcome: "requested",
        operation_id: UUID.uuid4(),
        completed_at: @run_at
      }),
      {:error, :stale_run}
    )
  end
end
