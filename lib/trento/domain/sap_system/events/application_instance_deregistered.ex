defmodule Trento.Domain.Events.ApplicationInstanceDeregistered do
  @moduledoc """
  This event is emitted when a database application is deregistered (decommissioned) from the SAP system.
  """

  use Trento.Event

  defevent do
    field :instance_number, :string
    field :host_id, Ecto.UUID
    field :sap_system_id, Ecto.UUID
    field :deregistered_at, :utc_datetime_usec
  end
end
