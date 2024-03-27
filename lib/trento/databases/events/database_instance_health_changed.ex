defmodule Trento.Databases.Events.DatabaseInstanceHealthChanged do
  @moduledoc """
  This event is emitted when a database instance health has changed.
  """

  import Trento.Databases.Events.Upcaster.Upcast, only: [upcast_legacy_aggregate: 1]

  use Trento.Support.Event

  require Trento.Enums.Health, as: Health

  defevent version: 2 do
    field :database_id, Ecto.UUID
    field :host_id, Ecto.UUID
    field :instance_number, :string
    field :health, Ecto.Enum, values: Health.values()
  end

  def upcast(params, _, 2), do: upcast_legacy_aggregate(params)
end
