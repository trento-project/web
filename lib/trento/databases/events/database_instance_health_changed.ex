defmodule Trento.Databases.Events.DatabaseInstanceHealthChanged do
  @moduledoc """
  This event is emitted when a database instance health has changed.
  """

  use Trento.Support.Event
  use Trento.Databases.Event.Upcaster.UpcastDatabaseId

  require Trento.Enums.Health, as: Health

  defevent version: 2 do
    field :database_id, Ecto.UUID
    field :host_id, Ecto.UUID
    field :instance_number, :string
    field :health, Ecto.Enum, values: Health.values()
  end
end
