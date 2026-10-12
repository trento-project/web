# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Databases.Events.DatabaseTombstoned do
  @moduledoc """
  This event is emitted when a database is deregistered (decommissioned)
  """

  use Trento.Support.Event

  defevent do
    field :database_id, Ecto.UUID
  end
end
