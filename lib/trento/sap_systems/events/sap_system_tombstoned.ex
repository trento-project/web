defmodule Trento.SapSystems.Events.SapSystemTombstoned do
  @moduledoc """
  This event is emitted when a SAP system is deregistered (decommissioned)
  """

  use Trento.Support.Event

  defevent do
    field :sap_system_id, Ecto.UUID
  end
end
