# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Databases.Events.DatabaseInstanceDataMarkedStale do
  @moduledoc """
  This event is emitted when a database instance data is marked as stale.
  """

  use Trento.Support.Event

  defevent do
    field :database_id, Ecto.UUID
    field :instance_number, :string
    field :host_id, Ecto.UUID
    field :stale_at, :utc_datetime_usec
  end
end
