defmodule Trento.Operations.ScheduleTest do
  use Trento.AggregateCase, aggregate: Trento.Operations.Schedule, async: true

  alias Trento.Operations.Commands.{
    CancelOperationSchedule,
    ChangeOperationSchedule,
    ScheduleOperation
  }

  alias Trento.Operations.Events.{
    OperationScheduleCancelled,
    OperationScheduleChanged,
    OperationScheduled
  }

  alias Trento.Operations.Schedule

  defp schedule_command(schedule_id) do
    ScheduleOperation.new!(%{
      schedule_id: schedule_id,
      target_type: "host",
      target_id: UUID.uuid4(),
      operation: "reboot",
      params: %{},
      starts_at: ~U[2026-11-07 02:00:00.000000Z],
      timezone: "Etc/UTC",
      recurrence: %{frequency: "daily", interval: 1},
      next_run_at: ~U[2026-11-07 02:00:00.000000Z],
      actor: "admin"
    })
  end

  test "should schedule an operation" do
    schedule_id = UUID.uuid4()
    %ScheduleOperation{target_id: target_id} = command = schedule_command(schedule_id)

    assert_events_and_state(
      [],
      command,
      [
        %OperationScheduled{
          schedule_id: schedule_id,
          target_type: "host",
          target_id: target_id,
          operation: "reboot",
          params: %{},
          starts_at: ~U[2026-11-07 02:00:00.000000Z],
          timezone: "Etc/UTC",
          recurrence: %{frequency: "daily", interval: 1},
          next_run_at: ~U[2026-11-07 02:00:00.000000Z],
          bulk_id: nil,
          actor: "admin"
        }
      ],
      fn state ->
        assert %Schedule{
                 schedule_id: ^schedule_id,
                 next_run_at: ~U[2026-11-07 02:00:00.000000Z],
                 occurrences: 0,
                 created_by: "admin"
               } = state
      end
    )
  end

  test "should not schedule the same schedule twice" do
    schedule_id = UUID.uuid4()
    command = schedule_command(schedule_id)

    assert_error(
      [struct(OperationScheduled, Map.from_struct(command))],
      command,
      {:error, :operation_schedule_already_exists}
    )
  end

  test "should change a schedule and restart its occurrences" do
    schedule_id = UUID.uuid4()
    %ScheduleOperation{target_id: target_id} = command = schedule_command(schedule_id)
    scheduled = struct(OperationScheduled, Map.from_struct(command))

    assert_events_and_state(
      [scheduled],
      ChangeOperationSchedule.new!(%{
        schedule_id: schedule_id,
        params: %{},
        starts_at: ~U[2026-11-10 04:00:00.000000Z],
        timezone: "Europe/Berlin",
        recurrence: nil,
        next_run_at: ~U[2026-11-10 04:00:00.000000Z],
        actor: "operator"
      }),
      [
        %OperationScheduleChanged{
          schedule_id: schedule_id,
          target_type: "host",
          target_id: target_id,
          operation: "reboot",
          params: %{},
          starts_at: ~U[2026-11-10 04:00:00.000000Z],
          timezone: "Europe/Berlin",
          recurrence: nil,
          next_run_at: ~U[2026-11-10 04:00:00.000000Z],
          bulk_id: nil,
          actor: "operator"
        }
      ],
      fn state ->
        assert %Schedule{
                 next_run_at: ~U[2026-11-10 04:00:00.000000Z],
                 recurrence: nil,
                 occurrences: 0
               } =
                 state
      end
    )
  end

  test "should not change an unknown schedule" do
    assert_error(
      ChangeOperationSchedule.new!(%{
        schedule_id: UUID.uuid4(),
        starts_at: ~U[2026-11-10 04:00:00.000000Z],
        timezone: "Etc/UTC",
        next_run_at: ~U[2026-11-10 04:00:00.000000Z],
        actor: "operator"
      }),
      {:error, :operation_schedule_not_found}
    )
  end

  test "should cancel a schedule and refuse any change after it" do
    schedule_id = UUID.uuid4()
    %ScheduleOperation{target_id: target_id} = command = schedule_command(schedule_id)
    scheduled = struct(OperationScheduled, Map.from_struct(command))

    assert_events(
      [scheduled],
      CancelOperationSchedule.new!(%{schedule_id: schedule_id, actor: "operator"}),
      [
        %OperationScheduleCancelled{
          schedule_id: schedule_id,
          target_type: "host",
          target_id: target_id,
          operation: "reboot",
          params: %{},
          starts_at: ~U[2026-11-07 02:00:00.000000Z],
          timezone: "Etc/UTC",
          recurrence: %{frequency: "daily", interval: 1},
          next_run_at: ~U[2026-11-07 02:00:00.000000Z],
          bulk_id: nil,
          actor: "operator"
        }
      ]
    )

    cancelled = %OperationScheduleCancelled{schedule_id: schedule_id, actor: "operator"}

    assert_error(
      [scheduled, cancelled],
      CancelOperationSchedule.new!(%{schedule_id: schedule_id, actor: "operator"}),
      {:error, :operation_schedule_not_found}
    )

    assert_error(
      [scheduled, cancelled],
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
end
