# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Databases.Commands.MarkDatabaseInstanceDataStale do
  @moduledoc """
  Mark a database instance data as stale.
  """
  @required_fields :all

  use Trento.Support.Command

  defcommand do
    field :database_id, Ecto.UUID
    field :instance_number, :string
    field :host_id, Ecto.UUID
    field :stale_at, :utc_datetime_usec
  end
end
