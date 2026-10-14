# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.ChecksScheduling.ExceptionWindow do
  @moduledoc """
  Time window in which checks are not executed for a host or a cluster.

  `duration` is in minutes.
  """

  use Ecto.Schema

  import Ecto.Changeset

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:id, :binary_id, autogenerate: true}
  schema "checks_exception_windows" do
    field :target_id, :binary_id
    field :target_type, Ecto.Enum, values: [:host, :cluster]
    field :starts_at, :utc_datetime_usec
    field :duration, :integer

    timestamps(type: :utc_datetime_usec)
  end

  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(window, attrs) do
    window
    |> cast(attrs, [:target_id, :target_type, :starts_at, :duration])
    |> validate_required([:target_id, :target_type, :starts_at, :duration])
    |> validate_number(:duration, greater_than: 0)
  end

  @spec active?(t(), DateTime.t()) :: boolean()
  def active?(%__MODULE__{starts_at: starts_at, duration: duration}, at) do
    DateTime.compare(at, starts_at) != :lt and
      DateTime.compare(at, DateTime.add(starts_at, duration, :minute)) == :lt
  end
end
