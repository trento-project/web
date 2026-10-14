# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.ChecksScheduling.ExceptionWindow do
  @moduledoc """
  One-time or recurring time window in which checks are not executed for a host or a cluster.

  `duration` is in minutes. Recurring windows use the same recurrence rules as
  operation schedules, see `Trento.Scheduling.Recurrence`.
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias Trento.Scheduling.Recurrence

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:id, :binary_id, autogenerate: true}
  schema "checks_exception_windows" do
    field :target_id, :binary_id
    field :target_type, Ecto.Enum, values: [:host, :cluster]
    field :starts_at, :utc_datetime_usec
    field :duration, :integer
    field :timezone, :string, default: "Etc/UTC"
    field :frequency, Ecto.Enum, values: [:daily, :weekly, :monthly, :yearly]
    field :interval, :integer, default: 1
    field :weekdays, {:array, :integer}, default: []
    field :ends_on, :date

    timestamps(type: :utc_datetime_usec)
  end

  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(window, attrs) do
    window
    |> cast(attrs, [
      :target_id,
      :target_type,
      :starts_at,
      :duration,
      :timezone,
      :frequency,
      :interval,
      :weekdays,
      :ends_on
    ])
    |> validate_required([:target_id, :target_type, :starts_at, :duration, :timezone])
    |> validate_number(:duration, greater_than: 0)
    |> validate_number(:interval, greater_than: 0)
    |> validate_subset(:weekdays, 1..7)
  end

  @spec active?(t(), DateTime.t()) :: boolean()
  def active?(%__MODULE__{} = window, at),
    do: Recurrence.within_occurrence?(window, window.duration, at)
end
