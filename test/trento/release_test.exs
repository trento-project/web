defmodule Trento.ReleaseTest do
  @moduledoc false
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  require Trento.ActivityLog.RetentionPeriodUnit, as: RetentionPeriodUnit

  alias Trento.ActivityLog.RetentionTime
  alias Trento.ActivityLog.Settings, as: ActivityLogSettings

  describe "Activity Log settings initiation" do
    test "should init default activity log retention time" do
      Trento.Release.init_default_activity_log_retention_time()

      assert %ActivityLogSettings{
               retention_time: %RetentionTime{
                 value: 1,
                 unit: RetentionPeriodUnit.months()
               }
             } = Trento.Repo.one(ActivityLogSettings.base_query())
    end

    test "should not change previously saved retention time" do
      value = 3
      unit = RetentionPeriodUnit.weeks()

      insert(:activity_log_settings,
        retention_time: %{
          value: value,
          unit: unit
        }
      )

      Trento.Release.init_default_activity_log_retention_time()

      assert %ActivityLogSettings{
               retention_time: %RetentionTime{
                 value: ^value,
                 unit: ^unit
               }
             } = Trento.Repo.one(ActivityLogSettings.base_query())
    end
  end
end
