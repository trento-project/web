defmodule Trento.SapSystems.Events.DatabaseRegistered do
  @moduledoc """
  This event is emitted when a database is registered.
  """

  use Trento.Support.Event

  require Trento.Enums.Health, as: Health

  defevent superseded_by: Trento.Databases.Events.DatabaseRegistered do
    field :sap_system_id, Ecto.UUID
    field :sid, :string
    field :health, Ecto.Enum, values: Health.values()
  end
end
