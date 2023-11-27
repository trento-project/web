defmodule Trento.SapSystems.Events.SapSystemHealthChanged do
  @moduledoc """
  This event is emitted when the SAP System health has changed.
  """

  use Trento.Support.Event

  require Trento.Enums.Health, as: Health

  defevent do
    field :sap_system_id, Ecto.UUID
    field :health, Ecto.Enum, values: Health.values()
  end
end
