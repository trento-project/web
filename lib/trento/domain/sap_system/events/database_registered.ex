defmodule Trento.Domain.Events.DatabaseRegistered do
  @moduledoc """
  This event is emitted when a database is registered.
  """

  use Trento.Event

  require Trento.Domain.Enums.Health, as: Health

  defevent do
    field :sap_system_id, Ecto.UUID
    field :sid, :string
    field :health, Ecto.Enum, values: Health.values()
  end
end
