# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Databases.Commands.DeregisterDatabaseInstance do
  @moduledoc """
  Deregister (decommission) a database instance from the monitoring system.
  """

  @required_fields :all

  use Trento.Support.Command

  defcommand do
    field :instance_number, :string
    field :host_id, Ecto.UUID
    field :database_id, Ecto.UUID
    field :deregistered_at, :utc_datetime_usec
  end
end
