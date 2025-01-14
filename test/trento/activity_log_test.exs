defmodule Trento.ActivityLogTest do
  @moduledoc false
  use ExUnit.Case
  use Trento.DataCase

  import Mox

  import Trento.Factory

  alias Trento.ActivityLog
  alias Trento.ActivityLog.ActivityLog, as: ActivityLogEntry

  setup :verify_on_exit!

  describe "retrieving logged activity" do
    test "should return an emtpty list" do
      assert {:ok, [], %Flop.Meta{}} = ActivityLog.list_activity_log(%{})
    end

    test "should return entries ordered by occurrence date" do
      older_occurrence = Faker.DateTime.backward(1)
      newer_occurrence = Faker.DateTime.forward(2)

      insert(:activity_log_entry, inserted_at: newer_occurrence)
      insert(:activity_log_entry, inserted_at: older_occurrence)

      assert {:ok,
              [
                %ActivityLogEntry{
                  inserted_at: ^newer_occurrence
                },
                %ActivityLogEntry{
                  inserted_at: ^older_occurrence
                }
              ], _} = ActivityLog.list_activity_log(%{})
    end

    test "should return paginated and default ordered by occurrence date activity log when no params provided" do
      # insert 100 log entries
      all_logs = insert_list(100, :activity_log_entry)

      default_params = %{}
      {:ok, logs, _} = ActivityLog.list_activity_log(default_params)

      # default limit is 25
      assert length(logs) == 25
      # default order is by inserted_at timestamp
      all_logs_sorted =
        all_logs |> Enum.sort_by(& &1.inserted_at, {:desc, DateTime}) |> Enum.take(25)

      assert logs == all_logs_sorted
    end

    test "should return earliest 5 paginated activity log entries" do
      all_logs = insert_list(100, :activity_log_entry)
      params = %{last: 5, order_by: [:inserted_at], order_directions: [:desc]}

      {:ok, logs, _} = ActivityLog.list_activity_log(params)

      assert length(logs) == 5

      all_logs_sorted =
        all_logs
        |> Enum.sort_by(& &1.inserted_at, {:desc, DateTime})
        |> Enum.drop(95)

      assert length(all_logs_sorted) == length(logs)
      assert all_logs_sorted == logs
    end

    test "should return most recent 5 paginated activity log entries" do
      all_logs = insert_list(100, :activity_log_entry)

      params = %{first: 5}
      {:ok, logs, _} = ActivityLog.list_activity_log(params)

      assert length(logs) == 5

      all_logs_sorted =
        all_logs
        |> Enum.sort_by(& &1.inserted_at, {:desc, DateTime})
        |> Enum.take(5)

      assert length(all_logs_sorted) == length(logs)
      assert all_logs_sorted == logs
    end

    test "should return latest paginated activity log entries number 26 to 50 (desc)" do
      all_logs = insert_list(100, :activity_log_entry)
      params = %{}

      {:ok, logs, meta} = ActivityLog.list_activity_log(params)

      assert length(logs) == 25
      new_params = %{first: 25, after: meta.end_cursor}

      {:ok, next_logs, _next_meta} = ActivityLog.list_activity_log(new_params)

      next_logs_alt =
        all_logs
        |> Enum.sort_by(& &1.inserted_at, {:desc, DateTime})
        |> Enum.drop(25)
        |> Enum.take(25)

      assert length(next_logs) == 25
      assert length(next_logs_alt) == length(next_logs)
      assert next_logs_alt == next_logs
    end

    test "should return latest paginated activity log entries number 21 to 25 (desc)" do
      all_logs = insert_list(100, :activity_log_entry)
      params = %{first: 26}

      {:ok, logs, meta} = ActivityLog.list_activity_log(params)

      assert length(logs) == 26
      new_params = %{last: 5, before: meta.end_cursor}

      {:ok, next_logs, _next_meta} = ActivityLog.list_activity_log(new_params)

      next_logs_alt =
        all_logs
        |> Enum.sort_by(& &1.inserted_at, {:desc, DateTime})
        |> Enum.drop(20)
        |> Enum.take(5)

      assert length(next_logs) == 5
      assert length(next_logs_alt) == length(next_logs)
      assert next_logs_alt == next_logs
    end

    test "should expose information about the existence of previous or next page to navigate to" do
      insert_list(100, :activity_log_entry)

      assert {:ok, _,
              %{has_previous_page?: false, has_next_page?: true, start_cursor: start_cursor}} =
               ActivityLog.list_activity_log(%{first: 5})

      assert {:ok, [],
              %{
                end_cursor: nil,
                start_cursor: nil
              }} =
               ActivityLog.list_activity_log(%{last: 5, before: start_cursor})

      assert {:ok, _, %{has_previous_page?: true, has_next_page?: true}} =
               ActivityLog.list_activity_log(%{first: 5, after: start_cursor})

      assert {:ok, _, %{has_previous_page?: true, has_next_page?: false, end_cursor: end_cursor}} =
               ActivityLog.list_activity_log(%{last: 5})

      assert {:ok, [],
              %{
                end_cursor: nil,
                start_cursor: nil
              }} =
               ActivityLog.list_activity_log(%{first: 5, after: end_cursor})

      assert {:ok, _, %{has_previous_page?: true, has_next_page?: true}} =
               ActivityLog.list_activity_log(%{last: 5, before: end_cursor})
    end
  end

  describe "Search by metadata tests" do
    test "Single keyword" do
      keyword = "Foo-4_2/:2.4"
      expected_result = insert(:activity_log_entry, metadata: %{"somefield" => keyword})
      insert_list(50, :activity_log_entry)
      {:ok, returned_results, _meta} = ActivityLog.list_activity_log(%{search: keyword})
      assert length(returned_results) == 1
      assert hd(returned_results).id == expected_result.id
    end

    test "Three keywords default connector (OR)" do
      keyword1 = "foo"
      keyword2 = "bar"
      keyword3 = "baaz"
      expected_result1 = insert(:activity_log_entry, metadata: %{"field1" => keyword1})
      expected_result2 = insert(:activity_log_entry, metadata: %{"field2" => keyword2})
      expected_result3 = insert(:activity_log_entry, metadata: %{"field3" => keyword3})
      insert_list(50, :activity_log_entry)

      search_string = "#{keyword1} #{keyword3} #{keyword2}"
      {:ok, returned_results, _meta} = ActivityLog.list_activity_log(%{search: search_string})
      assert length(returned_results) == 3

      assert returned_results |> Enum.map(& &1.id) |> Enum.sort() ==
               Enum.sort([expected_result1.id, expected_result2.id, expected_result3.id])
    end

    test "Three keywords connected by AND" do
      keyword1 = "foo"
      keyword2 = "bar"
      keyword3 = "baaz"

      expected_result1 =
        insert(:activity_log_entry,
          metadata: %{
            "field1" => keyword1,
            "field3" => keyword3,
            "field2" => %{"field4" => %{"field5" => keyword2}}
          }
        )

      _not_expected_result2 = insert(:activity_log_entry, metadata: %{"field2" => keyword2})

      _not_expected_result3 =
        insert(:activity_log_entry, metadata: %{"field3" => keyword3, "field4" => keyword3})

      insert_list(50, :activity_log_entry)

      search_string = "#{keyword1} AND #{keyword3} AND #{keyword2}"
      {:ok, returned_results, _meta} = ActivityLog.list_activity_log(%{search: search_string})
      assert length(returned_results) == 1

      assert hd(returned_results).id == expected_result1.id
    end

    test "Should return results in appropriate numeric range" do
      keyword1 = 9
      keyword2 = 10
      keyword3 = 42

      expected_result1 =
        insert(:activity_log_entry,
          metadata: %{
            "field1" => keyword1,
            "field3" => keyword3,
            "field2" => %{"field4" => %{"field5" => keyword3}}
          }
        )

      expected_result2 = insert(:activity_log_entry, metadata: %{"field2" => keyword2})

      _not_expected_result3 =
        insert(:activity_log_entry, metadata: %{"field3" => keyword3, "field4" => keyword3})

      insert_list(50, :activity_log_entry)

      search_string = ">8 AND <11"
      {:ok, returned_results, _meta} = ActivityLog.list_activity_log(%{search: search_string})
      assert length(returned_results) == 2

      assert Enum.sort([expected_result1.id, expected_result2.id]) ==
               returned_results |> Enum.map(& &1.id) |> Enum.sort()
    end

    test "malformed query yields empty result" do
      insert_list(50, :activity_log_entry)
      {:ok, [], _meta} = ActivityLog.list_activity_log(%{search: "@!$%"})
    end
  end
end
