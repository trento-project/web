# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.OperationSchedule do
  @moduledoc """
  One-time or periodic schedule of an operation on a target.

  See `Trento.Scheduling.Recurrence` for the meaning of the recurrence fields.
  `next_run_at` is nil once the schedule has ended.
  """

  use Ecto.Schema

  import Ecto.Changeset

  require Trento.Operations.Enums.HostOperations, as: HostOperations

  @type t :: %__MODULE__{}

  @operations Enum.map(HostOperations.values(), &Atom.to_string/1)

  @editable_fields ~w(starts_at timezone frequency interval weekdays ends_on max_occurrences params)a

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:id, :binary_id, autogenerate: true}
  schema "operation_schedules" do
    field :target_type, Ecto.Enum, values: [:host]
    field :target_id, :binary_id
    field :operation, :string
    field :params, :map, default: %{}
    field :starts_at, :utc_datetime_usec
    field :timezone, :string
    field :frequency, Ecto.Enum, values: [:daily, :weekly, :monthly, :yearly]
    field :interval, :integer, default: 1
    field :weekdays, {:array, :integer}, default: []
    field :ends_on, :date
    field :max_occurrences, :integer
    field :occurrences, :integer, default: 0
    field :next_run_at, :utc_datetime_usec
    field :created_by_id, :integer

    timestamps(type: :utc_datetime_usec)
  end

  @spec create_changeset(map(), DateTime.t()) :: Ecto.Changeset.t()
  def create_changeset(attrs, now) do
    %__MODULE__{}
    |> cast(attrs, [:target_type, :target_id, :operation, :created_by_id | @editable_fields])
    |> validate_required([:target_type, :target_id, :operation])
    |> validate_inclusion(:operation, @operations)
    |> validate_recurrence(now)
    |> unique_constraint([:target_id, :operation],
      message: "is already scheduled for this target"
    )
  end

  @spec update_changeset(t(), map(), DateTime.t()) :: Ecto.Changeset.t()
  def update_changeset(schedule, attrs, now) do
    schedule
    |> cast(attrs, @editable_fields)
    |> put_change(:occurrences, 0)
    |> validate_recurrence(now)
  end

  defp validate_recurrence(changeset, now) do
    changeset
    |> validate_required([:starts_at, :timezone, :interval])
    |> validate_number(:interval, greater_than: 0)
    |> validate_number(:max_occurrences, greater_than: 0)
    |> validate_subset(:weekdays, 1..7)
    |> validate_change(:timezone, fn :timezone, timezone ->
      if Tzdata.zone_exists?(timezone), do: [], else: [timezone: "is not a valid timezone"]
    end)
    |> validate_change(:starts_at, fn :starts_at, starts_at ->
      if DateTime.compare(starts_at, now) == :gt,
        do: [],
        else: [starts_at: "must be in the future"]
    end)
  end
end
