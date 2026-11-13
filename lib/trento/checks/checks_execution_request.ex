# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Checks.ChecksExecutionRequest do
  @moduledoc """
  When the periodic checks of a host or cluster were last requested.
  """

  use Ecto.Schema

  @type t :: %__MODULE__{}

  @primary_key {:target_id, :binary_id, autogenerate: false}
  schema "checks_execution_requests" do
    field :target_type, Ecto.Enum, values: [:host, :cluster]
    field :last_requested_at, :utc_datetime_usec

    timestamps(type: :utc_datetime_usec)
  end
end
