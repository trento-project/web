# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Events.OperationScheduleChanged do
  @moduledoc """
  The params and the timing of an operation schedule are replaced.
  The occurrence count restarts.
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
    field :next_run_at, :utc_datetime_usec
    field :bulk_id, Ecto.UUID
    field :actor, :string
  end
end
