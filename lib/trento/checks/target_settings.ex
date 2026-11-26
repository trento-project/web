# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Checks.TargetSettings do
  @moduledoc """
  The checks frequency settings of a host or cluster, used instead of the global ones.
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias Trento.Checks.Frequency

  @type t :: %__MODULE__{}

  @primary_key {:target_id, :binary_id, autogenerate: false}
  schema "checks_target_settings" do
    field :target_type, Ecto.Enum, values: [:host, :cluster]
    field :enabled, :boolean

    embeds_one :frequency, Frequency, on_replace: :update

    timestamps(type: :utc_datetime_usec)
  end

  @spec changeset(t() | Ecto.Changeset.t(), map()) :: Ecto.Changeset.t()
  def changeset(target_settings, attrs) do
    target_settings
    |> cast(attrs, [:enabled])
    |> validate_required([:enabled])
    |> cast_embed(:frequency, required: true)
  end
end
