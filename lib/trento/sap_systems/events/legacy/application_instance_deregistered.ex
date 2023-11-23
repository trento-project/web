defmodule Trento.Domain.Events.ApplicationInstanceDeregistered do
  @moduledoc """
  This event is emitted when a database application is deregistered (decommissioned) from the SAP system.
  """

  use Trento.Support.Event

  defevent superseded_by: Trento.SapSystems.Events.ApplicationInstanceDeregistered do
    field :instance_number, :string
    field :host_id, Ecto.UUID
    field :sap_system_id, Ecto.UUID
    field :deregistered_at, :utc_datetime_usec
  end
end
