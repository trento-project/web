defmodule Trento.ActivityLog.QueueEventParserTest do
  @moduledoc false

  use ExUnit.Case, async: true
  use Trento.DataCase, async: true

  import Trento.Factory

  alias Trento.ActivityLog.Logger.Parser.QueueEventParser
  alias Trento.Users
  alias Trento.Users.User

  describe "operation completed" do
    test "should get actor if operation requested is logged" do
      %{operation_id: operation_id} = operation_completed = build(:operation_completed_v1)

      %{actor: actor} =
        insert(:activity_log_entry,
          type: "someresource_operation_requested",
          metadata: %{"operation_id" => operation_id}
        )

      assert actor ==
               QueueEventParser.get_activity_actor(:operation_completed, %{
                 queue_event: operation_completed
               })
    end

    test "should get default system actor if operation requested is not logged" do
      operation_completed = build(:operation_completed_v1)

      assert "system" ==
               QueueEventParser.get_activity_actor(:operation_completed, %{
                 queue_event: operation_completed
               })
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
               QueueEventParser.get_activity_metadata(:operation_completed, %{
                 queue_event: operation_completed
               })
    end
  end

  describe "checks customization" do
    test "should get correct actor" do
      %{id: active_user_id, username: active_username} = insert(:user)

      %{id: deleted_user_id, username: original_username} = user = insert(:user)

      {:ok, %User{username: deleted_username}} = Users.delete_user(user)

      messages =
        [
          {:check_customization_applied, build(:check_customization_applied_v1)},
          {:check_customization_reset, build(:check_customization_reset_v1)}
        ]

      for {activity, message} <- messages do
        assert "system" == QueueEventParser.get_activity_actor(activity, %{queue_event: message})

        assert "system" ==
                 QueueEventParser.get_activity_actor(activity, %{
                   queue_event: message,
                   metadata: %{}
                 })

        assert active_username ==
                 QueueEventParser.get_activity_actor(activity, %{
                   queue_event: message,
                   metadata: %{user_id: active_user_id}
                 })

        refute original_username == deleted_username

        assert original_username ==
                 QueueEventParser.get_activity_actor(activity, %{
                   queue_event: message,
                   metadata: %{user_id: deleted_user_id}
                 })
      end
    end

    test "should get correct metadata" do
      check_id = Faker.UUID.v4()
      group_id = Faker.UUID.v4()
      target_type = "host"

      check_customization_applied =
        build(:check_customization_applied_v1,
          check_id: check_id,
          group_id: group_id,
          target_type: target_type,
          custom_values: [
            %{name: "value_1", value: {:string_value, "string_value"}},
            %{name: "value_2", value: {:int_value, 1}},
            %{name: "value_3", value: {:bool_value, true}}
          ]
        )

      check_customization_reset =
        build(:check_customization_reset_v1,
          check_id: check_id,
          group_id: group_id,
          target_type: target_type
        )

      messages =
        [
          %{
            activity: :check_customization_applied,
            message: check_customization_applied,
            expected_metadata: %{
              check_id: check_id,
              group_id: group_id,
              target_type: target_type,
              custom_values: [
                %{name: "value_1", value: "string_value"},
                %{name: "value_2", value: 1},
                %{name: "value_3", value: true}
              ]
            }
          },
          %{
            activity: :check_customization_reset,
            message: check_customization_reset,
            expected_metadata: %{
              check_id: check_id,
              group_id: group_id,
              target_type: target_type
            }
          }
        ]

      for %{activity: activity, message: message, expected_metadata: expected_metadata} <-
            messages do
        assert expected_metadata ==
                 QueueEventParser.get_activity_metadata(activity, %{queue_event: message})
      end
    end
  end

  test "should return 'system' by default" do
    assert "system" == QueueEventParser.get_activity_actor(:unknown, %{})
  end

  test "should return empty metadata in unknown event" do
    assert %{} == QueueEventParser.get_activity_metadata(:unknown, %{})
  end
end
