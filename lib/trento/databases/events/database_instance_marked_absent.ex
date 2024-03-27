defmodule Trento.Databases.Events.DatabaseInstanceMarkedAbsent do
  @moduledoc """
  This event is emitted when a database instance is marked as absent.
  """

  import Trento.Databases.Events.Upcaster.Upcast, only: [upcast_legacy_aggregate: 1]

  use Trento.Support.Event

  defevent version: 2 do
    field :instance_number, :string
    field :host_id, Ecto.UUID
    field :database_id, Ecto.UUID
    field :absent_at, :utc_datetime_usec
  end

  def upcast(params, _, 2), do: upcast_legacy_aggregate(params)
end
