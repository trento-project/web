defmodule Trento.Databases.Events.DatabaseTombstoned do
  @moduledoc """
  This event is emitted when a database is deregistered (decommissioned)
  """

  use Trento.Support.Event

  defevent do
    field :database_id, Ecto.UUID
  end
end
