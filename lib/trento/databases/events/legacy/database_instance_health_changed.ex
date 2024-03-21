defmodule Trento.SapSystems.Events.DatabaseInstanceHealthChanged do
  @moduledoc """
  This event is emitted when a database instance health has changed.
  """

  use Trento.Support.Event

  require Trento.Enums.Health, as: Health

  defevent superseded_by: Trento.Databases.Events.DatabaseInstanceHealthChanged do
    field :sap_system_id, Ecto.UUID
    field :host_id, Ecto.UUID
    field :instance_number, :string
    field :health, Ecto.Enum, values: Health.values()
  end
end
