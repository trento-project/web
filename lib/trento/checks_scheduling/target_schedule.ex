# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.ChecksScheduling.TargetSchedule do
  @moduledoc """
  Checks execution settings of a host or cluster: its own interval (nil for
  the global one), its exception window and its last periodic request.

  Not stored: the interval and the window live in the Host and Cluster
  aggregates and their read models, the last request in
  `Trento.ChecksScheduling.ExecutionRequest`. This struct validates new
  settings and answers when the next execution runs.
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias Trento.ChecksScheduling.Interval

  @type t :: %__MODULE__{}

  @window_fields [
    :window_starts_at,
    :window_timezone,
    :window_duration_minutes,
    :window_frequency,
    :window_interval,
    :window_weekdays
  ]

  @frequencies ~w(daily weekly monthly yearly)
  @frequency_atoms %{
    "daily" => :daily,
    "weekly" => :weekly,
    "monthly" => :monthly,
    "yearly" => :yearly
  }

  @primary_key false
  embedded_schema do
    field :target_id, Ecto.UUID
    field :target_type, :string
    field :interval, :string
    field :window_starts_at, :utc_datetime_usec
    field :window_timezone, :string
    field :window_duration_minutes, :integer
    field :window_frequency, :string
    field :window_interval, :integer
    field :window_weekdays, {:array, :integer}
    field :last_requested_at, :utc_datetime_usec
  end

  @doc """
  The settings as their read model holds them, nil when the target has none:
  the exception window in the shape of the API, with string keys once stored.
  """
  @spec from_projection(String.t(), String.t() | nil, map() | nil, DateTime.t() | nil) :: t()
  def from_projection(target_id, target_type, settings, last_requested_at) do
    settings = settings || %{interval: nil, exception_window: nil}
    window = settings.exception_window && stringify(settings.exception_window)
    recurrence = window && window["recurrence"] && stringify(window["recurrence"])

    %__MODULE__{
      target_id: target_id,
      target_type: target_type,
      interval: settings.interval,
      window_starts_at: window && parse_datetime(window["starts_at"]),
      window_timezone: window && window["timezone"],
      window_duration_minutes: window && window["duration_minutes"],
      window_frequency: recurrence && recurrence["frequency"],
      window_interval: recurrence && recurrence["interval"],
      window_weekdays: recurrence && recurrence["weekdays"],
      last_requested_at: last_requested_at
    }
  end

  @doc """
  The exception window to store in the aggregate, with string keys.
  """
  @spec window_to_store(t()) :: map() | nil
  def window_to_store(%__MODULE__{} = schedule) do
    case exception_window(schedule) do
      nil -> nil
      window -> window |> Jason.encode!() |> Jason.decode!()
    end
  end

  defp stringify(map), do: Map.new(map, fn {key, value} -> {to_string(key), value} end)

  defp parse_datetime(%DateTime{} = datetime), do: datetime

  defp parse_datetime(value) when is_binary(value) do
    {:ok, datetime, _} = DateTime.from_iso8601(value)
    DateTime.add(datetime, 0, :microsecond)
  end

  @doc """
  Replaces the interval and the exception window. A nil window removes it.
  """
  @spec changeset(t(), map(), DateTime.t()) :: Ecto.Changeset.t()
  def changeset(schedule, %{interval: interval} = attrs, now) do
    schedule
    |> cast(%{interval: interval}, [:interval])
    |> validate_inclusion(:interval, Interval.values(), message: "is not an allowed interval")
    |> cast(window_attrs(Map.get(attrs, :exception_window)), @window_fields, empty_values: [])
    |> validate_window(now)
  end

  @spec exception_window(t()) :: map() | nil
  def exception_window(%__MODULE__{window_starts_at: nil}), do: nil

  def exception_window(%__MODULE__{} = schedule) do
    %{
      starts_at: schedule.window_starts_at,
      timezone: schedule.window_timezone,
      duration_minutes: schedule.window_duration_minutes,
      recurrence:
        schedule.window_frequency &&
          %{
            frequency: schedule.window_frequency,
            interval: schedule.window_interval,
            weekdays: schedule.window_weekdays
          }
    }
  end

  @doc """
  The exception window in the shape `Trento.Scheduling.Recurrence` expects.
  """
  @spec window_recurrence(t()) :: map() | nil
  def window_recurrence(%__MODULE__{window_starts_at: nil}), do: nil

  def window_recurrence(%__MODULE__{} = schedule) do
    %{
      starts_at: schedule.window_starts_at,
      timezone: schedule.window_timezone,
      frequency: Map.get(@frequency_atoms, schedule.window_frequency),
      interval: schedule.window_interval || 1,
      weekdays: schedule.window_weekdays || []
    }
  end

  defp window_attrs(nil), do: Map.new(@window_fields, &{&1, nil})

  defp window_attrs(window) do
    recurrence = Map.get(window, :recurrence) || %{}

    %{
      window_starts_at: Map.get(window, :starts_at),
      window_timezone: Map.get(window, :timezone),
      window_duration_minutes: Map.get(window, :duration_minutes),
      window_frequency: Map.get(recurrence, :frequency),
      window_interval: Map.get(recurrence, :interval, if(recurrence == %{}, do: nil, else: 1)),
      window_weekdays: Map.get(recurrence, :weekdays, if(recurrence == %{}, do: nil, else: []))
    }
  end

  defp validate_window(changeset, now) do
    if get_field(changeset, :window_starts_at) do
      changeset
      |> validate_required([:window_starts_at, :window_timezone, :window_duration_minutes])
      |> validate_number(:window_duration_minutes, greater_than: 0)
      |> validate_inclusion(:window_frequency, @frequencies)
      |> validate_number(:window_interval, greater_than: 0)
      |> validate_subset(:window_weekdays, Enum.to_list(1..7))
      |> validate_change(:window_timezone, fn :window_timezone, timezone ->
        if Tzdata.zone_exists?(timezone),
          do: [],
          else: [window_timezone: "is not a valid timezone"]
      end)
      |> validate_not_ended(now)
    else
      changeset
    end
  end

  defp validate_not_ended(%Ecto.Changeset{valid?: false} = changeset, _), do: changeset

  defp validate_not_ended(changeset, now) do
    with nil <- get_field(changeset, :window_frequency),
         starts_at = get_field(changeset, :window_starts_at),
         duration = get_field(changeset, :window_duration_minutes),
         :lt <- DateTime.compare(DateTime.add(starts_at, duration, :minute), now) do
      add_error(changeset, :window_starts_at, "the exception window has already ended")
    else
      _ -> changeset
    end
  end
end
