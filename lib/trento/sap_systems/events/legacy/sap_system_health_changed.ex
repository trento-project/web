defmodule Trento.Domain.Events.SapSystemHealthChanged do
  @moduledoc """
  This event is emitted when the SAP System health has changed.
  """

  use Trento.Support.Event

  require Trento.Domain.Enums.Health, as: Health

  defevent superseded_by: Trento.SapSystems.Events.SapSystemHealthChanged do
    field :sap_system_id, Ecto.UUID
    field :health, Ecto.Enum, values: Health.values()
  end
end
