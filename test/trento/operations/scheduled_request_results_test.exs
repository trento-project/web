defmodule Trento.Operations.ScheduledRequestResultsTest do
  use ExUnit.Case, async: true
  use Trento.DataCase

  import Trento.Factory

  alias Trento.ActivityLog.ActivityLog
  alias Trento.Operations.ScheduledRequestResults

  defp scheduled_request!(operation_id) do
    schedule_id = UUID.uuid4()

    insert(:activity_log_entry,
      type: "scheduled_operation_requested",
      actor: "system",
      metadata: %{
        "operation_id" => operation_id,
        "schedule_id" => schedule_id,
        "correlation_id" => schedule_id,
        "target_id" => UUID.uuid4(),
        "operation" => "reboot"
      }
    )

    schedule_id
  end

  test "should record that a scheduled request was refused because another operation runs" do
    %{operation_id: operation_id} =
      event = build(:operation_completed_with_failed_request_v1, error: :ALREADY_RUNNING)

    schedule_id = scheduled_request!(operation_id)

    assert :ok == ScheduledRequestResults.record(event)

    assert %ActivityLog{
             actor: "system",
             severity: 13,
             metadata: %{
               "reason" => "already_running",
               "operation_id" => ^operation_id,
               "schedule_id" => ^schedule_id,
               "correlation_id" => ^schedule_id
             }
           } = Repo.get_by!(ActivityLog, type: "scheduled_operation_request_failed")
  end

  test "should ignore requests that were not scheduled" do
    event = build(:operation_completed_with_failed_request_v1, error: :ALREADY_RUNNING)

    assert :ok == ScheduledRequestResults.record(event)
    assert nil == Repo.get_by(ActivityLog, type: "scheduled_operation_request_failed")
  end

  test "should ignore the other results of a scheduled request" do
    for event <- [
          build(:operation_completed_with_failed_request_v1, error: :ARGUMENTS_MISSING),
          build(:operation_completed_v1, result: :UPDATED)
        ] do
      scheduled_request!(event.operation_id)
      assert :ok == ScheduledRequestResults.record(event)
    end

    assert nil == Repo.get_by(ActivityLog, type: "scheduled_operation_request_failed")
  end
end
