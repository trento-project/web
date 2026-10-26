defmodule Trento.ChecksScheduling.IntervalTest do
  use ExUnit.Case, async: true

  alias Trento.ChecksScheduling.Interval

  test "should list the intervals a user can choose, 5 minutes being the default" do
    assert ~w(5m 15m 30m 1h 6h 12h 24h 1w 2w 4w disabled) == Interval.values()
    assert "5m" == Interval.default()
  end

  test "should convert an interval to minutes, nil when disabled" do
    assert 5 == Interval.to_minutes("5m")
    assert 360 == Interval.to_minutes("6h")
    assert 20_160 == Interval.to_minutes("2w")
    assert nil == Interval.to_minutes("disabled")
  end

  test "should parse the interval of the environment" do
    assert {:ok, "1h"} == Interval.parse("1h")
    assert {:ok, "disabled"} == Interval.parse("disabled")
  end

  test "should accept the minutes that the environment variable took before" do
    assert {:ok, "15m"} == Interval.parse("15")
    assert {:ok, "1h"} == Interval.parse("60")
    assert {:ok, "24h"} == Interval.parse("1440")
  end

  test "should refuse an interval that is not allowed" do
    for value <- ["7", "7m", "2h", "", "never", nil] do
      assert :error == Interval.parse(value)
    end
  end
end
