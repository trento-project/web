defmodule Trento.Operations.Projections.OperationScheduleProjectorTest do
  use ExUnit.Case
  use Trento.DataCase

  alias Trento.Operations.Events.{OperationScheduleChanged, OperationScheduled}
  alias Trento.Operations.OperationSchedule
  alias Trento.Operations.Projections.OperationScheduleProjector

  test "should project a scheduled operation" do
    schedule_id = UUID.uuid4()
    target_id = UUID.uuid4()

    Trento.ProjectorTestHelper.project(
      OperationScheduleProjector,
      %OperationScheduled{
        schedule_id: schedule_id,
        target_type: "host",
        target_id: target_id,
        operation: "reboot",
        params: %{},
        starts_at: ~U[2026-11-07 02:00:00.000000Z],
        timezone: "Europe/Berlin",
        recurrence: %{"frequency" => "weekly", "interval" => 2, "weekdays" => [6, 7]},
        next_run_at: ~U[2026-11-07 02:00:00.000000Z],
        actor: "admin"
      },
      "operation_schedule_projector"
    )

    assert %OperationSchedule{
             target_id: ^target_id,
             frequency: "weekly",
             interval: 2,
             weekdays: [6, 7],
             max_occurrences: nil,
             next_run_at: ~U[2026-11-07 02:00:00.000000Z],
             occurrences: 0,
             created_by: "admin"
           } = Repo.get!(OperationSchedule, schedule_id)
  end

  test "should project a changed schedule" do
    schedule_id = UUID.uuid4()

    Repo.insert!(%OperationSchedule{
      id: schedule_id,
      target_type: "host",
      target_id: UUID.uuid4(),
      operation: "reboot",
      starts_at: ~U[2026-11-07 02:00:00.000000Z],
      timezone: "Etc/UTC",
      frequency: "daily",
      next_run_at: ~U[2026-11-08 02:00:00.000000Z],
      occurrences: 1
    })

    Trento.ProjectorTestHelper.project(
      OperationScheduleProjector,
      %OperationScheduleChanged{
        schedule_id: schedule_id,
        params: %{"maintenance" => true},
        starts_at: ~U[2026-11-10 04:00:00.000000Z],
        timezone: "Europe/Berlin",
        recurrence: nil,
        next_run_at: ~U[2026-11-10 04:00:00.000000Z],
        actor: "operator"
      },
      "operation_schedule_projector"
    )

    assert %OperationSchedule{
             params: %{"maintenance" => true},
             frequency: nil,
             timezone: "Europe/Berlin",
             next_run_at: ~U[2026-11-10 04:00:00.000000Z],
             occurrences: 0
           } = Repo.get!(OperationSchedule, schedule_id)
  end
end
