# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Scheduling.RecurrenceTest do
  use ExUnit.Case, async: true

  alias Trento.Scheduling.Recurrence

  defp rule(attrs) do
    Map.merge(
      %{
        starts_at: ~U[2026-10-14 10:00:00Z],
        timezone: "Etc/UTC",
        frequency: nil,
        interval: 1,
        weekdays: [],
        ends_on: nil,
        max_occurrences: nil,
        occurrences: 0
      },
      Map.new(attrs)
    )
  end

  describe "one-time" do
    test "should occur only once, at the start" do
      schedule = rule([])

      assert ~U[2026-10-14 10:00:00Z] ==
               Recurrence.next_occurrence(schedule, ~U[2026-10-14 09:00:00Z])

      assert nil == Recurrence.next_occurrence(schedule, ~U[2026-10-14 10:00:00Z])
    end
  end

  describe "daily" do
    test "should occur every X days at the same time" do
      schedule = rule(frequency: :daily, interval: 2)

      assert ~U[2026-10-16 10:00:00Z] ==
               Recurrence.next_occurrence(schedule, ~U[2026-10-14 10:00:00Z])
    end

    test "should keep the local time across a daylight saving time change" do
      # 03:00 in Berlin: CEST (UTC+2) before 25 October 2026, CET (UTC+1) after
      schedule =
        rule(frequency: :daily, starts_at: ~U[2026-10-24 01:00:00Z], timezone: "Europe/Berlin")

      assert ~U[2026-10-25 02:00:00Z] ==
               Recurrence.next_occurrence(schedule, ~U[2026-10-24 01:00:00Z])
    end

    test "should move a local time that does not exist to the first valid time" do
      # 02:30 does not exist in Berlin on 28 March 2027, clocks jump from 02:00 to 03:00
      schedule =
        rule(frequency: :daily, starts_at: ~U[2027-03-27 01:30:00Z], timezone: "Europe/Berlin")

      assert ~U[2027-03-28 01:00:00Z] ==
               Recurrence.next_occurrence(schedule, ~U[2027-03-27 01:30:00Z])
    end

    test "should find the next occurrence long after the start" do
      schedule = rule(frequency: :daily, interval: 3, starts_at: ~U[2026-01-01 08:00:00Z])

      # 2030-06-15 is an occurrence day (1626 days after the start), at 08:00
      assert ~U[2030-06-18 08:00:00Z] ==
               Recurrence.next_occurrence(schedule, ~U[2030-06-15 12:00:00Z])
    end
  end

  describe "weekly" do
    test "should occur on the selected weekdays every X weeks" do
      # 14 October 2026 is a Wednesday. Mondays (1) and Thursdays (4), every 2 weeks.
      schedule = rule(frequency: :weekly, interval: 2, weekdays: [4, 1])

      assert ~U[2026-10-15 10:00:00Z] ==
               Recurrence.next_occurrence(schedule, ~U[2026-10-14 09:00:00Z])

      assert ~U[2026-10-26 10:00:00Z] ==
               Recurrence.next_occurrence(schedule, ~U[2026-10-15 10:00:00Z])

      assert ~U[2026-10-29 10:00:00Z] ==
               Recurrence.next_occurrence(schedule, ~U[2026-10-26 10:00:00Z])
    end
  end

  describe "monthly" do
    test "should occur on the last day of shorter months" do
      schedule = rule(frequency: :monthly, starts_at: ~U[2027-01-31 08:00:00Z])

      assert ~U[2027-02-28 08:00:00Z] ==
               Recurrence.next_occurrence(schedule, ~U[2027-01-31 08:00:00Z])

      assert ~U[2027-03-31 08:00:00Z] ==
               Recurrence.next_occurrence(schedule, ~U[2027-02-28 08:00:00Z])
    end
  end

  describe "yearly" do
    test "should occur on 28 February when the start is 29 February" do
      schedule = rule(frequency: :yearly, starts_at: ~U[2028-02-29 08:00:00Z])

      assert ~U[2029-02-28 08:00:00Z] ==
               Recurrence.next_occurrence(schedule, ~U[2028-02-29 08:00:00Z])
    end
  end

  describe "end conditions" do
    test "should not occur on the end date or after it" do
      schedule = rule(frequency: :daily, ends_on: ~D[2026-10-16])

      assert ~U[2026-10-15 10:00:00Z] ==
               Recurrence.next_occurrence(schedule, ~U[2026-10-14 10:00:00Z])

      assert nil == Recurrence.next_occurrence(schedule, ~U[2026-10-15 10:00:00Z])
    end

    test "should not occur after the given number of occurrences" do
      schedule = rule(frequency: :daily, max_occurrences: 3, occurrences: 3)

      assert nil == Recurrence.next_occurrence(schedule, ~U[2026-10-16 10:00:00Z])
    end
  end

  describe "occurrence windows" do
    test "should tell whether a time falls inside a recurring window" do
      # Every Saturday (6) from 22:00 Berlin time (20:00Z in CEST), for 4 hours
      schedule =
        rule(
          frequency: :weekly,
          weekdays: [6],
          starts_at: ~U[2026-10-17 20:00:00Z],
          timezone: "Europe/Berlin"
        )

      assert Recurrence.within_occurrence?(schedule, 240, ~U[2026-10-24 20:00:00Z])
      assert Recurrence.within_occurrence?(schedule, 240, ~U[2026-10-24 23:59:00Z])
      refute Recurrence.within_occurrence?(schedule, 240, ~U[2026-10-25 00:00:00Z])
      refute Recurrence.within_occurrence?(schedule, 240, ~U[2026-10-17 19:59:00Z])
    end
  end
end
