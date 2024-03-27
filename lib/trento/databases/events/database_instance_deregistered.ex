defmodule Trento.Databases.Events.DatabaseInstanceDeregistered do
  @moduledoc """
  This event is emitted when a database instance is deregistered (decommissioned).
  """

  import Trento.Databases.Events.Upcaster.Upcast, only: [upcast_legacy_aggregate: 1]

  use Trento.Support.Event

  defevent version: 2 do
    field :instance_number, :string
    field :host_id, Ecto.UUID
    field :database_id, Ecto.UUID
    field :deregistered_at, :utc_datetime_usec
  end

  def upcast(params, _, 2), do: upcast_legacy_aggregate(params)
end
