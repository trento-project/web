# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Databases.Events.DatabaseInstanceDataMarkedInSync do
  @moduledoc """
  This event is emitted when a database instance data is marked as
  synchronized and valid.
  """

  use Trento.Support.Event

  defevent do
    field :database_id, Ecto.UUID
    field :instance_number, :string
    field :host_id, Ecto.UUID
  end
end
