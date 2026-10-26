# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Events.ScheduledOperationRequested do
  @moduledoc """
  The operation of a scheduled occurrence was requested.
  next_run_at is the following occurrence, nil when the schedule ended.
  """

  use Trento.Support.Event

  defevent do
    field :schedule_id, Ecto.UUID
    field :target_type, :string
    field :target_id, Ecto.UUID
    field :operation, :string
    field :params, :map
    field :starts_at, :utc_datetime_usec
    field :timezone, :string
    field :recurrence, :map
    field :bulk_id, Ecto.UUID
    field :actor, :string
    field :run_at, :utc_datetime_usec
    field :operation_id, Ecto.UUID
    field :occurrences, :integer
    field :next_run_at, :utc_datetime_usec
  end
end
