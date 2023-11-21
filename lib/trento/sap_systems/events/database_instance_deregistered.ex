defmodule Trento.SapSystems.Events.DatabaseInstanceDeregistered do
  @moduledoc """
  This event is emitted when a database instance is deregistered (decommissioned) from the SAP system.
  """

  use Trento.Event

  defevent do
    field :instance_number, :string
    field :host_id, Ecto.UUID
    field :sap_system_id, Ecto.UUID
    field :deregistered_at, :utc_datetime_usec
  end
end
