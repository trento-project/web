# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Settings.ChecksExecutionSettings do
  @moduledoc """
  Global checks execution interval, see `Trento.ChecksScheduling.Interval`.
  """

  use Ecto.Schema
  use Trento.Support.Ecto.STI, sti_identifier: :checks_execution_settings

  import Ecto.Changeset

  alias Trento.ChecksScheduling.Interval

  @type t :: %__MODULE__{}

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "settings" do
    field :interval, :string, source: :checks_execution_interval
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
