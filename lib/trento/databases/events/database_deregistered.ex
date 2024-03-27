defmodule Trento.Databases.Events.DatabaseDeregistered do
  @moduledoc """
  This event is emitted once all database instances belonging to a HANA database have been deregistered (decommissioned).
  """

  import Trento.Databases.Events.Upcaster.Upcast, only: [upcast_legacy_aggregate: 1]

  use Trento.Support.Event

  defevent version: 2 do
    field :database_id, Ecto.UUID
    field :deregistered_at, :utc_datetime_usec
  end

  def upcast(params, _, 2), do: upcast_legacy_aggregate(params)
end
