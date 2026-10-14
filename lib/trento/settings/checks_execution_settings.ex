# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Settings.ChecksExecutionSettings do
  @moduledoc """
  Global checks execution settings.

  `interval` is in minutes.
  """

  use Ecto.Schema
  use Trento.Support.Ecto.STI, sti_identifier: :checks_execution_settings

  import Ecto.Changeset

  alias Trento.ChecksScheduling.Interval

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, only: [:interval, :enforced_from_env]}
  @primary_key {:id, :binary_id, autogenerate: true}
  schema "settings" do
    field :interval, :integer, source: :checks_execution_interval
    field :enforced_from_env, :boolean, virtual: true, default: false

    timestamps(type: :utc_datetime_usec)
    sti_fields()
  end

  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(settings, attrs) do
    settings
    |> cast(attrs, [:interval])
    |> sti_changes()
    |> validate_required([:interval])
    |> Interval.validate(:interval)
    |> unique_constraint(:type)
  end
end
