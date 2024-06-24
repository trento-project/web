defmodule Trento.ActivityLogTest do
  @moduledoc false
  use ExUnit.Case
  use Trento.DataCase

  import Mox

  import Trento.Factory

  require Trento.ActivityLog.RetentionPeriodUnit, as: RetentionPeriodUnit

  alias Trento.ActivityLog
  alias Trento.ActivityLog.RetentionTime
  alias Trento.ActivityLog.Settings

  setup :verify_on_exit!

  describe "retrieving activity log settings" do
    test "should return an error when settings are not available" do
      assert {:error, :activity_log_settings_not_configured} == ActivityLog.get_settings()
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
               ActivityLog.change_retention_period(42, RetentionPeriodUnit.days())
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
        unit: RetentionPeriodUnit.days()
      },
      %{
        name: "weeks",
        value: 3,
        unit: RetentionPeriodUnit.weeks()
      },
      %{
        name: "months",
        value: 5,
        unit: RetentionPeriodUnit.months()
      },
      %{
        name: "years",
        value: 7,
        unit: RetentionPeriodUnit.years()
      }
    ]

    for %{name: name} = scenario <- scenarios do
      @scenario scenario

      test "should successfully change retention periods #{name}" do
        insert(:activity_log_settings,
          retention_time: %{
            value: 92,
            unit: RetentionPeriodUnit.years()
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
      initial_retention_period_unit = RetentionPeriodUnit.days()

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
end
