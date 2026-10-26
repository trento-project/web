# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Commands.CancelOperationSchedule do
  @moduledoc """
  Cancel an operation schedule: it no longer runs.
  """

  @required_fields :all

  use Trento.Support.Command

  defcommand do
    field :schedule_id, Ecto.UUID
    field :actor, :string
  end
end
