defmodule Trento.SapSystems.Events.DatabaseRestored do
  @moduledoc """
  This event is emitted when a database is restored.
  """

  use Trento.Support.Event

  require Trento.Domain.Enums.Health, as: Health

  defevent do
    field :sap_system_id, Ecto.UUID
    field :health, Ecto.Enum, values: Health.values()
  end
end
