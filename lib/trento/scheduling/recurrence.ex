# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Scheduling.Recurrence do
  @moduledoc """
  Computes the occurrences of a one-time or periodic schedule.

  A schedule starts at `starts_at` and repeats in the local time of `timezone`:

  - `frequency: nil`: one-time, at `starts_at`
  - `:daily`: every `interval` days
  - `:weekly`: every `interval` weeks, on `weekdays` (1 Monday .. 7 Sunday),
    or on the weekday of the start when `weekdays` is empty
  - `:monthly`: every `interval` months, on the day of the month of the start
    (the last day of the month when the month is shorter)
  - `:yearly`: every `interval` years, on the day of the start
    (28 February when the start is 29 February and the year is not a leap year)

  End conditions: `ends_on` (no occurrence on that local date or after it),
  `max_occurrences` (compared with `occurrences`, the number already done).

  An occurrence keeps the local time across daylight saving time changes.
  A local time that does not exist (spring forward) moves to the first valid time,
  a local time that exists twice (fall back) uses the first one.
  """

  @tz_db Tzdata.TimeZoneDatabase

  @type frequency :: :daily | :weekly | :monthly | :yearly | nil

  @type t :: %{
          required(:starts_at) => DateTime.t(),
          required(:timezone) => String.t(),
          required(:frequency) => frequency(),
          required(:interval) => pos_integer(),
          optional(:weekdays) => [1..7],
          optional(:ends_on) => Date.t() | nil,
          optional(:max_occurrences) => pos_integer() | nil,
          optional(:occurrences) => non_neg_integer()
        }

  @doc """
  Returns the first occurrence strictly after `instant`, or nil when the schedule has ended.
  """
  @spec next_occurrence(t(), DateTime.t()) :: DateTime.t() | nil
  def next_occurrence(%{max_occurrences: max, occurrences: done}, _instant)
      when is_integer(max) and done >= max,
      do: nil

  def next_occurrence(%{starts_at: starts_at, timezone: timezone} = schedule, instant) do
    local_start = to_local(starts_at, timezone)
    local_instant = to_local(instant, timezone)

    schedule
    |> local_candidates(local_start, NaiveDateTime.to_date(local_instant))
    |> Enum.find_value(fn local ->
      utc = to_utc(local, timezone)
      if DateTime.compare(utc, instant) == :gt, do: {local, utc}
    end)
    |> within_end_date(schedule)
  end

  @doc """
  Tells whether `at` falls inside an occurrence lasting `duration` minutes.
  """
  @spec within_occurrence?(t(), pos_integer(), DateTime.t()) :: boolean()
  def within_occurrence?(schedule, duration, at) do
    case next_occurrence(schedule, DateTime.add(at, -duration, :minute)) do
      nil -> false
      occurrence -> DateTime.compare(occurrence, at) != :gt
    end
  end

  # Local occurrence candidates, in increasing order, starting a bit before `instant_date`.
  defp local_candidates(%{frequency: nil}, local_start, _instant_date), do: [local_start]

  defp local_candidates(%{frequency: :daily, interval: interval}, local_start, instant_date) do
    start_date = NaiveDateTime.to_date(local_start)
    first = max(0, div(Date.diff(instant_date, start_date), interval) - 1)

    first
    |> Stream.iterate(&(&1 + 1))
    |> Stream.map(&NaiveDateTime.add(local_start, &1 * interval, :day))
  end

  defp local_candidates(
         %{frequency: :weekly, interval: interval} = schedule,
         local_start,
         instant_date
       ) do
    start_date = NaiveDateTime.to_date(local_start)
    week_start = Date.beginning_of_week(start_date)

    weekdays =
      case Map.get(schedule, :weekdays, []) do
        [] -> [Date.day_of_week(start_date)]
        weekdays -> Enum.sort(weekdays)
      end

    first = max(0, div(div(Date.diff(instant_date, week_start), 7), interval) - 1)

    Stream.iterate(first, &(&1 + 1))
    |> Stream.flat_map(fn week ->
      Enum.map(weekdays, &Date.add(week_start, week * interval * 7 + &1 - 1))
    end)
    |> Stream.reject(&(Date.compare(&1, start_date) == :lt))
    |> Stream.map(&NaiveDateTime.new!(&1, NaiveDateTime.to_time(local_start)))
  end

  defp local_candidates(%{frequency: :monthly, interval: interval}, local_start, instant_date) do
    months_between =
      (instant_date.year - local_start.year) * 12 + instant_date.month - local_start.month

    first = max(0, div(months_between, interval) - 1)

    first
    |> Stream.iterate(&(&1 + 1))
    |> Stream.map(fn step ->
      months = local_start.year * 12 + local_start.month - 1 + step * interval
      at_day(local_start, div(months, 12), rem(months, 12) + 1)
    end)
  end

  defp local_candidates(%{frequency: :yearly, interval: interval}, local_start, instant_date) do
    first = max(0, div(instant_date.year - local_start.year, interval) - 1)

    first
    |> Stream.iterate(&(&1 + 1))
    |> Stream.map(&at_day(local_start, local_start.year + &1 * interval, local_start.month))
  end

  # Same day and time as `local_start`, clamped to the last day of the month
  defp at_day(local_start, year, month) do
    day = min(local_start.day, :calendar.last_day_of_the_month(year, month))
    NaiveDateTime.new!(Date.new!(year, month, day), NaiveDateTime.to_time(local_start))
  end

  defp within_end_date(nil, _schedule), do: nil

  defp within_end_date({local, utc}, schedule) do
    case Map.get(schedule, :ends_on) do
      nil ->
        utc

      ends_on ->
        if Date.compare(NaiveDateTime.to_date(local), ends_on) == :lt, do: utc
    end
  end

  defp to_local(utc, timezone),
    do: utc |> DateTime.shift_zone!(timezone, @tz_db) |> DateTime.to_naive()

  defp to_utc(local, timezone) do
    zoned =
      case DateTime.from_naive(local, timezone, @tz_db) do
        {:ok, datetime} -> datetime
        {:ambiguous, first, _second} -> first
        {:gap, _just_before, just_after} -> just_after
      end

    DateTime.shift_zone!(zoned, "Etc/UTC", @tz_db)
  end
end
