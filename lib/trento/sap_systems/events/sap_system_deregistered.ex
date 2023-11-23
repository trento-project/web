defmodule Trento.SapSystems.Events.SapSystemDeregistered do
  @moduledoc """
  This event is emitted when a SAP system is deregistered (decommissioned).
  """

  use Trento.Support.Event

  defevent do
    field :sap_system_id, Ecto.UUID
    field :deregistered_at, :utc_datetime_usec
  end
end
