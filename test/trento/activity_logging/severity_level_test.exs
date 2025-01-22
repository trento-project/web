defmodule Trento.ActivityLog.SeverityLevelTest do
  use ExUnit.Case, async: true

  alias Trento.ActivityLog.SeverityLevel

  @severity_level_mapping %{
    "activity_type_1" => :info,
    "activity_type_2" => :warning,
    "activity_type_4" => %{
      type: :kv,
      key_suffix: "some_health_suffix",
      values: %{
        "critical" => :critical,
        "unknown" => :warning,
        "*" => :debug
      },
      condition: :map_value_to_severity
    },
    "activity_type_5" => %{type: :key, key: :reason, condition: :key_exists},
    "activity_type_6" => %{
      type: :kv,
      key_suffix: "some_health_suffix",
      values: %{
        "critical" => :critical,
        "unknown" => :warning,
        "*" => :debug
      },
      condition: :map_value_to_severity
    }
  }
  describe "map_severity_level/3" do
    test "should map unmapped activity type to info" do
      unknown_activity_type = "activity_type_0"
      metadata = %{}

      severity =
        SeverityLevel.map_severity_level(unknown_activity_type, metadata, @severity_level_mapping)

      assert severity == :info
    end

    test "should map explicitly mapped activity types correctly" do
      info_activity_type = "activity_type_1"
      warning_activity_type = "activity_type_2"
      metadata = %{}

      severity1 =
        SeverityLevel.map_severity_level(info_activity_type, metadata, @severity_level_mapping)

      severity2 =
        SeverityLevel.map_severity_level(warning_activity_type, metadata, @severity_level_mapping)

      assert severity1 == :info
      assert severity2 == :warning
    end

    test "should map conditional key suffix types appropriately" do
      activity_type = "activity_type_4"

      metadata1 = %{
        :someprefix_some_health_suffix => :critical
      }

      metadata2 = %{
        :someprefix_some_health_suffix => :unknown
      }

      metadata3 = %{
        :someprefix_some_health_suffix => :passing
      }

      severity1 =
        SeverityLevel.map_severity_level(activity_type, metadata1, @severity_level_mapping)

      severity2 =
        SeverityLevel.map_severity_level(activity_type, metadata2, @severity_level_mapping)

      severity3 =
        SeverityLevel.map_severity_level(activity_type, metadata3, @severity_level_mapping)

      assert severity1 == :critical
      assert severity2 == :warning
      assert severity3 == :debug
    end

    test "should map key exists activity types appropriately in the warning case" do
      activity_type = "activity_type_5"

      metadata = %{
        reason: "some_reason"
      }

      severity =
        SeverityLevel.map_severity_level(activity_type, metadata, @severity_level_mapping)

      assert severity == :warning
    end

    test "should map key exists activity types appropriately in the info case" do
      activity_type = "activity_type_5"

      metadata = %{}

      severity =
        SeverityLevel.map_severity_level(activity_type, metadata, @severity_level_mapping)

      assert severity == :info
    end

    test "should map conditional key suffix types with no metadata correctly" do
      activity_type = "activity_type_6"
      metadata = %{}

      severity =
        SeverityLevel.map_severity_level(activity_type, metadata, @severity_level_mapping)

      assert severity == :info
    end
  end
end
