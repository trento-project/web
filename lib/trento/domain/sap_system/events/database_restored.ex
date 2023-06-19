defmodule Trento.Domain.Events.DatabaseRestored do
  @moduledoc """
  This event is emitted when a database is restored.
  """

  use Trento.Event

  require Trento.Domain.Enums.Health, as: Health

  defevent do
    field :sap_system_id, Ecto.UUID
    field :sid, :string
    field :health, Ecto.Enum, values: Health.values()
  end
end
