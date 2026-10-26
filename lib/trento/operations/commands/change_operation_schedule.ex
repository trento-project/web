# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Commands.ChangeOperationSchedule do
  @moduledoc """
  Replace the params and the timing of an operation schedule.
  """

  @required_fields [:schedule_id, :starts_at, :timezone, :next_run_at, :actor]

  use Trento.Support.Command

  defcommand do
    field :schedule_id, Ecto.UUID
    field :params, :map, default: %{}
    field :starts_at, :utc_datetime_usec
    field :timezone, :string
    field :recurrence, :map
    field :next_run_at, :utc_datetime_usec
    field :actor, :string
  end
end
