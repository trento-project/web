# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Events.ScheduledRunStarted do
  @moduledoc """
  The run of an occurrence of an operation schedule started. An event handler
  checks the policies and requests the operation.
  """

  use Trento.Support.Event

  defevent do
    field :schedule_id, Ecto.UUID
    field :run_at, :utc_datetime_usec
    field :started_at, :utc_datetime_usec
  end
end
