defmodule Trento.Databases.Events.DatabaseRestored do
  @moduledoc """
  This event is emitted when a database is restored.
  """

  use Trento.Support.Event
  use Trento.Databases.Event.Upcaster.UpcastDatabaseId

  require Trento.Enums.Health, as: Health

  defevent version: 2 do
    field :database_id, Ecto.UUID
    field :health, Ecto.Enum, values: Health.values()
  end
end
