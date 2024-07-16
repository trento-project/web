defmodule Trento.ActivityLogTest do
  @moduledoc false
  use ExUnit.Case
  use Trento.DataCase

  import Mox

  import Trento.Factory

  require Trento.ActivityLog.RetentionPeriodUnit, as: RetentionPeriodUnit

  alias Trento.ActivityLog
  alias Trento.ActivityLog.ActivityLog, as: ActivityLogEntry
  alias Trento.ActivityLog.RetentionTime
  alias Trento.ActivityLog.Settings

  setup :verify_on_exit!

  describe "retrieving activity log settings" do
    test "should return an error when settings are not available" do
      assert {:error, :not_found} == ActivityLog.get_settings()
    end

    test "should return settings" do
      %{
        retention_time: %{
          value: value,
          unit: unit
        }
      } = insert(:activity_log_settings)

      assert {:ok,
              %Settings{
                retention_time: %RetentionTime{
                  value: ^value,
                  unit: ^unit
                }
              }} = ActivityLog.get_settings()
    end
  end

  describe "changing activity log settings" do
    test "should not be able to change retention time if no activity log settings were previously saved" do
      assert {:error, :activity_log_settings_not_configured} ==
               ActivityLog.change_retention_period(42, RetentionPeriodUnit.day())
    end

    @validation_scenarios [
      %{
        invalid_retention_periods: [-1, 0],
        expected_errors: [
          value:
            {"must be greater than %{number}",
             [validation: :number, kind: :greater_than, number: 0]}
        ]
      },
      %{
        invalid_retention_periods: [nil, "", "  "],
        expected_errors: [value: {"can't be blank", [validation: :required]}]
      }
    ]

    test "should not accept invalid retention periods" do
      insert(:activity_log_settings)

      for %{
            invalid_retention_periods: invalid_retention_periods,
            expected_errors: expected_errors
          } <- @validation_scenarios do
        Enum.each(invalid_retention_periods, fn invalid_retention_period ->
          unit = Faker.Util.pick(RetentionPeriodUnit.values())

          assert {:error,
                  %{
                    valid?: false,
                    changes: %{retention_time: %{errors: ^expected_errors}}
                  }} =
                   ActivityLog.change_retention_period(
                     invalid_retention_period,
                     unit
                   )
        end)
      end
    end

    test "should not accept unsupported retention period units" do
      insert(:activity_log_settings)

      for unit <- [:foo, :bar, :baz] do
        assert {:error,
                %{
                  valid?: false,
                  changes: %{
                    retention_time: %{
                      errors: [
                        unit: {"is invalid", _}
                      ]
                    }
                  }
                }} = ActivityLog.change_retention_period(42, unit)
      end
    end

    scenarios = [
      %{
        name: "days",
        value: 1,
        unit: RetentionPeriodUnit.day()
      },
      %{
        name: "weeks",
        value: 3,
        unit: RetentionPeriodUnit.week()
      },
      %{
        name: "months",
        value: 5,
        unit: RetentionPeriodUnit.month()
      },
      %{
        name: "years",
        value: 7,
        unit: RetentionPeriodUnit.year()
      }
    ]

    for %{name: name} = scenario <- scenarios do
      @scenario scenario

      test "should successfully change retention periods #{name}" do
        insert(:activity_log_settings,
          retention_time: %{
            value: 92,
            unit: RetentionPeriodUnit.year()
          }
        )

        %{
          value: value,
          unit: unit
        } = @scenario

        assert {:ok,
                %Settings{
                  retention_time: %RetentionTime{
                    value: ^value,
                    unit: ^unit
                  }
                }} =
                 ActivityLog.change_retention_period(
                   value,
                   unit
                 )
      end
    end

    test "should successfully handle unchanging retention periods" do
      initial_retention_period = 42
      initial_retention_period_unit = RetentionPeriodUnit.day()

      insert(:activity_log_settings,
        retention_time: %{
          value: initial_retention_period,
          unit: initial_retention_period_unit
        }
      )

      assert {:ok,
              %Settings{
                retention_time: %RetentionTime{
                  value: ^initial_retention_period,
                  unit: ^initial_retention_period_unit
                }
              }} =
               ActivityLog.change_retention_period(
                 initial_retention_period,
                 initial_retention_period_unit
               )
    end
  end

  describe "retrieving logged activity" do
    test "should return an emtpty list" do
      assert [] == ActivityLog.list_activity_log()
    end

    test "should return entries ordered by occurrence date" do
      older_occurrence = Faker.DateTime.backward(1)
      newer_occurrence = Faker.DateTime.forward(2)

      insert(:activity_log_entry, inserted_at: newer_occurrence)
      insert(:activity_log_entry, inserted_at: older_occurrence)

      assert [
               %ActivityLogEntry{
                 inserted_at: ^newer_occurrence
               },
               %ActivityLogEntry{
                 inserted_at: ^older_occurrence
               }
             ] = ActivityLog.list_activity_log()
    end

    test "should return paginated and default ordered by occurrence date activity log when no params provided" do
      # insert 100 log entries
      all_logs = Enum.map(1..100, fn _ -> insert(:activity_log_entry) end)

      default_params = %{}
      {:ok, logs, _} = ActivityLog.list_activity_log(default_params)

      # default limit is 25
      assert length(logs) == 25
      # default order is by inserted_at timestamp
      all_logs_sorted =
        all_logs |> Enum.sort_by(fn entry -> entry.inserted_at end, :desc) |> Enum.take(25)

      assert logs == all_logs_sorted
    end

    test "should return earliest 5 paginated activity log entries" do
      all_logs = Enum.map(1..100, fn _ -> insert(:activity_log_entry) end)
      params = %{last: 5, order_by: [:inserted_at], order_directions: [:desc]}

      {:ok, logs, _} = ActivityLog.list_activity_log(params)

      assert length(logs) == 5

      all_logs_sorted =
        all_logs
        |> Enum.sort_by(fn entry -> entry.inserted_at end, :desc)
        |> Enum.drop(95)

      assert length(all_logs_sorted) == length(logs)
      assert all_logs_sorted == logs
    end

    test "should return latest paginated activity log entries number 26 to 50 (desc)" do
      all_logs = Enum.map(1..100, fn _ -> insert(:activity_log_entry) end)
      params = %{}

      {:ok, logs, meta} = ActivityLog.list_activity_log(params)

      assert length(logs) == 25
      new_params = Flop.to_next_cursor(meta)

      {:ok, next_logs, _next_meta} = ActivityLog.list_activity_log(new_params)

      next_logs_alt =
        all_logs
        |> Enum.sort_by(fn entry -> entry.inserted_at end, :desc)
        |> Enum.drop(25)
        |> Enum.take(25)

      assert length(next_logs) == 25
      assert length(next_logs_alt) == length(next_logs)
      assert next_logs_alt == next_logs
    end
  end
end
