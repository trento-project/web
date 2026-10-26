defmodule Trento.Operations.ScheduleTest do
  use Trento.AggregateCase, aggregate: Trento.Operations.Schedule, async: true

  alias Trento.Operations.Commands.ScheduleOperation
  alias Trento.Operations.Events.OperationScheduled
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
end
