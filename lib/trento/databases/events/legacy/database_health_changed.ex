defmodule Trento.SapSystems.Events.DatabaseHealthChanged do
  @moduledoc """
  This event is emitted when a database health has changed.
  """

  use Trento.Support.Event

  require Trento.Enums.Health, as: Health

  defevent superseded_by: Trento.Databases.Events.DatabaseHealthChanged do
    field :sap_system_id, Ecto.UUID
    field :health, Ecto.Enum, values: Health.values()
  end
end
