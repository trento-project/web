# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Commands.CompleteScheduledRun do
  @moduledoc """
  Record the outcome of a scheduled run: the operation was requested, or the
  request failed and why.
  """

  @required_fields [:schedule_id, :run_at, :outcome, :completed_at]

  use Trento.Support.Command

  defcommand do
    field :schedule_id, Ecto.UUID
    field :run_at, :utc_datetime_usec
    field :outcome, Ecto.Enum, values: [:requested, :failed]
    field :operation_id, Ecto.UUID
    field :reason, :string
    field :errors, {:array, :map}, default: []
    field :completed_at, :utc_datetime_usec
  end
end
