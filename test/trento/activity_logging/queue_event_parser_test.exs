defmodule Trento.ActivityLog.QueueEventParserTest do
  @moduledoc false

  use ExUnit.Case, async: true
  use Trento.DataCase, async: true

  import Trento.Factory

  alias Trento.ActivityLog.Logger.Parser.QueueEventParser

  describe "operation completed" do
    test "should get actor if operation requested is logged" do
      %{operation_id: operation_id} = operation_completed = build(:operation_completed_v1)

      %{actor: actor} =
        insert(:activity_log_entry,
          type: "operation_requested",
          metadata: %{"operation_id" => operation_id}
        )

      assert actor ==
               QueueEventParser.get_activity_actor(:operation_completed, operation_completed)
    end

    test "should get default system actor if operation requested is not logged" do
      operation_completed = build(:operation_completed_v1)

      assert "system" ==
               QueueEventParser.get_activity_actor(:operation_completed, operation_completed)
    end

    test "should get operation completed metadata" do
      %{
        operation_id: operation_id,
        group_id: group_id,
        result: result
      } =
        operation_completed =
        build(:operation_completed_v1, operation_type: "saptuneapplysolution@v1")

      assert %{
               operation_id: operation_id,
               resource_id: group_id,
               operation: :saptune_solution_apply,
               result: result
             } ==
               QueueEventParser.get_activity_metadata(:operation_completed, operation_completed)
    end
  end

  test "should return a nil actor in unknown event" do
    assert nil == QueueEventParser.get_activity_actor(:unknown, %{})
  end

  test "should return empty metadata in unknown event" do
    assert %{} == QueueEventParser.get_activity_metadata(:unknown, %{})
  end
end
