# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Commands.ScheduleOperation do
  @moduledoc """
  Schedule an operation on a target, once or periodically.
  """

  @required_fields [
    :schedule_id,
    :target_type,
    :target_id,
    :operation,
    :starts_at,
    :timezone,
    :next_run_at,
    :actor
  ]

  use Trento.Support.Command

  defcommand do
    field :schedule_id, Ecto.UUID
    field :target_type, :string
    field :target_id, Ecto.UUID
    field :operation, :string
    field :params, :map, default: %{}
    field :starts_at, :utc_datetime_usec
    field :timezone, :string
    field :recurrence, :map
    field :next_run_at, :utc_datetime_usec
    field :bulk_id, Ecto.UUID
    field :actor, :string
  end
end
