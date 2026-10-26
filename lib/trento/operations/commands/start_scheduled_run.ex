# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Commands.StartScheduledRun do
  @moduledoc """
  Start the run of the next occurrence of an operation schedule.
  """

  @required_fields :all

  use Trento.Support.Command

  defcommand do
    field :schedule_id, Ecto.UUID
    field :run_at, :utc_datetime_usec
    field :started_at, :utc_datetime_usec
  end
end
