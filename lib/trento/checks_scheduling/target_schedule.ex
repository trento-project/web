# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.ChecksScheduling.TargetSchedule do
  @moduledoc """
  Checks execution schedule of a host or a cluster.

  `interval` overrides the global checks execution interval when set.
  `last_scheduled_at` is the last time a periodic execution was requested.
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias Trento.ChecksScheduling.Interval

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:target_id, :binary_id, autogenerate: false}
  schema "checks_schedules" do
    field :target_type, Ecto.Enum, values: [:host, :cluster]
    field :interval, :integer
    field :last_scheduled_at, :utc_datetime_usec

    timestamps(type: :utc_datetime_usec)
  end

  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(schedule, attrs) do
    schedule
    |> cast(attrs, [:target_id, :target_type, :interval, :last_scheduled_at])
    |> validate_required([:target_id, :target_type])
    |> Interval.validate(:interval)
  end
end
