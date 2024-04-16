defmodule Trento.Databases.Events.DatabaseDeregistered do
  @moduledoc """
  This event is emitted once all database instances belonging to a HANA database have been deregistered (decommissioned).
  """

  use Trento.Support.Event
  use Trento.Databases.Event.Upcaster.UpcastDatabaseId

  defevent version: 2 do
    field :database_id, Ecto.UUID
    field :deregistered_at, :utc_datetime_usec
  end
end
