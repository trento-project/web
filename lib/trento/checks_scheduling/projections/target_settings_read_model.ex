# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.ChecksScheduling.Projections.TargetSettingsReadModel do
  @moduledoc """
  Checks execution settings of a host or cluster, projected from its events.
  The exception window keeps the shape of the API, with string keys.
  """

  use Ecto.Schema

  @type t :: %__MODULE__{}

  @primary_key {:target_id, Ecto.UUID, autogenerate: false}
  schema "checks_target_settings" do
    field :target_type, :string
    field :interval, :string
    field :exception_window, :map

    timestamps(type: :utc_datetime_usec)
  end
end
