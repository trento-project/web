# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Settings.ChecksFrequencySettings do
  @moduledoc """
  ChecksFrequencySettings is the STI projection of the global checks frequency.

  When `enabled` is false the checks do not run periodically. The frequency stays saved, so
  enabling the checks again restores it.
  """

  use Ecto.Schema
  use Trento.Support.Ecto.STI, sti_identifier: :checks_frequency_settings

  import Ecto.Changeset

  alias Trento.Checks.Frequency

  @type t :: %__MODULE__{}

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "settings" do
    field :enabled, :boolean, source: :checks_frequency_enabled

    embeds_one :frequency, Frequency,
      source: :checks_frequency,
      on_replace: :update

    field :enforced_from_env, :boolean, virtual: true, default: false

    timestamps(type: :utc_datetime_usec)
    sti_fields()
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(settings, attrs) do
    settings
    |> cast(attrs, [:enabled])
    |> validate_required([:enabled])
    |> cast_embed(:frequency, required: true)
    |> sti_changes()
    |> unique_constraint(:type)
  end
end
