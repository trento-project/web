# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Databases.Events.DatabaseDataMarkedStale do
  @moduledoc """
  This event is emitted when a database data is marked as stale.
  """

  use Trento.Support.Event

  defevent do
    field :database_id, Ecto.UUID
    field :stale_at, :utc_datetime_usec
  end
end
