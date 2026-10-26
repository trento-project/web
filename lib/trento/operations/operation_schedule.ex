# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.OperationSchedule do
  @moduledoc """
  One-time or periodic schedule of an operation on a target.

  `next_run_at` is the next occurrence, see `Trento.Scheduling.Recurrence`.
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias Trento.Operations.Requests
  alias Trento.Scheduling.Recurrence

  @type t :: %__MODULE__{}

  @target_types ~w(host cluster sap_system database)
  @frequencies ~w(daily weekly monthly yearly)
  @frequency_atoms %{
    "daily" => :daily,
    "weekly" => :weekly,
    "monthly" => :monthly,
    "yearly" => :yearly
  }

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "operation_schedules" do
    field :target_type, :string
    field :target_id, Ecto.UUID
    field :operation, :string
    field :params, :map, default: %{}
    field :starts_at, :utc_datetime_usec
    field :timezone, :string
    field :frequency, :string
    field :interval, :integer, default: 1
    field :weekdays, {:array, :integer}, default: []
    field :ends_on, :date
    field :max_occurrences, :integer
    field :next_run_at, :utc_datetime_usec
    field :occurrences, :integer, default: 0
    field :bulk_id, Ecto.UUID
    field :created_by, :string

    timestamps(type: :utc_datetime_usec)
  end

  @doc """
  Validates the target, the operation and when it runs, and sets the first occurrence.
  `recurrence` is nil for a one-time schedule.
  """
  @spec changeset(t(), map(), DateTime.t()) :: Ecto.Changeset.t()
  def changeset(schedule, attrs, now) do
    schedule
    |> cast(attrs, [:target_type, :target_id, :operation, :params, :bulk_id, :created_by])
    |> validate_required([:target_type, :target_id, :operation])
    |> validate_inclusion(:target_type, @target_types)
    |> validate_schedulable()
    |> timing_changeset(attrs, now)
  end

  @doc """
  Replaces params and timing. The occurrence count restarts.
  """
  @spec update_changeset(t(), map(), DateTime.t()) :: Ecto.Changeset.t()
  def update_changeset(schedule, attrs, now) do
    schedule
    |> cast(attrs, [:params])
    |> put_change(:occurrences, 0)
    |> timing_changeset(attrs, now)
  end

  @spec recurrence(t()) :: map() | nil
  def recurrence(%__MODULE__{frequency: nil}), do: nil

  def recurrence(%__MODULE__{} = schedule) do
    Map.take(schedule, [:frequency, :interval, :weekdays, :ends_on, :max_occurrences])
  end

  @doc """
  The schedule in the shape `Trento.Scheduling.Recurrence` expects.
  """
  @spec to_recurrence(t()) :: Recurrence.t()
  def to_recurrence(%__MODULE__{} = schedule) do
    %{
      starts_at: schedule.starts_at,
      timezone: schedule.timezone,
      frequency: Map.get(@frequency_atoms, schedule.frequency),
      interval: schedule.interval,
      weekdays: schedule.weekdays,
      ends_on: schedule.ends_on,
      max_occurrences: schedule.max_occurrences,
      occurrences: schedule.occurrences
    }
  end

  defp timing_changeset(changeset, attrs, now) do
    recurrence = Map.get(attrs, :recurrence) || Map.get(attrs, "recurrence") || %{}

    changeset
    |> cast(attrs, [:starts_at, :timezone])
    |> cast(normalize_recurrence(recurrence), [
      :frequency,
      :interval,
      :weekdays,
      :ends_on,
      :max_occurrences
    ])
    |> validate_required([:starts_at, :timezone, :interval])
    |> validate_change(:starts_at, fn :starts_at, starts_at ->
      if DateTime.compare(starts_at, now) == :lt, do: [starts_at: "is in the past"], else: []
    end)
    |> validate_change(:timezone, fn :timezone, timezone ->
      if Tzdata.zone_exists?(timezone), do: [], else: [timezone: "is not a valid timezone"]
    end)
    |> validate_inclusion(:frequency, @frequencies)
    |> validate_number(:interval, greater_than: 0)
    |> validate_number(:max_occurrences, greater_than: 0)
    |> validate_subset(:weekdays, Enum.to_list(1..7))
    |> put_first_occurrence()
  end

  defp normalize_recurrence(recurrence) do
    recurrence
    |> Map.new(fn {key, value} -> {to_string(key), value} end)
    |> Map.put_new("frequency", nil)
    |> Map.put_new("interval", 1)
    |> Map.put_new("weekdays", [])
    |> Map.put_new("ends_on", nil)
    |> Map.put_new("max_occurrences", nil)
  end

  defp validate_schedulable(changeset) do
    with target_type when is_binary(target_type) <- get_field(changeset, :target_type),
         operation when is_binary(operation) <- get_field(changeset, :operation),
         true <- schedulable?(target_type, operation) do
      changeset
    else
      false -> add_error(changeset, :operation, "cannot be scheduled on this target")
      _ -> changeset
    end
  end

  defp schedulable?(target_type, operation),
    do: match?({:ok, _, _}, Requests.parse(target_type, operation))

  defp put_first_occurrence(%Ecto.Changeset{valid?: false} = changeset), do: changeset

  defp put_first_occurrence(changeset) do
    schedule = apply_changes(changeset)
    before_start = DateTime.add(schedule.starts_at, -1, :microsecond)

    case Recurrence.next_occurrence(to_recurrence(schedule), before_start) do
      nil -> add_error(changeset, :ends_on, "leaves no occurrence")
      first -> put_change(changeset, :next_run_at, first)
    end
  end
end
