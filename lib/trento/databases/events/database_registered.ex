defmodule Trento.Databases.Events.DatabaseRegistered do
  @moduledoc """
  This event is emitted when a database is registered.
  """

  import Trento.Databases.Events.Upcaster.Upcast, only: [upcast_legacy_aggregate: 1]

  use Trento.Support.Event

  require Trento.Enums.Health, as: Health

  defevent version: 2 do
    field :database_id, Ecto.UUID
    field :sid, :string
    field :health, Ecto.Enum, values: Health.values()
  end

  def upcast(params, _, 2), do: upcast_legacy_aggregate(params)
end
