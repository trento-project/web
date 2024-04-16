defmodule Trento.Databases.Events.DatabaseRestored do
  @moduledoc """
  This event is emitted when a database is restored.
  """

  use Trento.Support.Event

  require Trento.Enums.Health, as: Health

  defevent do
    field :database_id, Ecto.UUID
    field :health, Ecto.Enum, values: Health.values()
  end
end
