defmodule Trento.Domain.Events.SapSystemRestored do
  @moduledoc """
  This event is emitted when a sap system is restored.
  """

  use Trento.Event

  require Trento.Domain.Enums.Health, as: Health

  defevent superseded_by: Trento.SapSystems.Events.SapSystemRestored do
    field :sap_system_id, Ecto.UUID
    field :tenant, :string
    field :db_host, :string
    field :health, Ecto.Enum, values: Health.values()
  end
end
