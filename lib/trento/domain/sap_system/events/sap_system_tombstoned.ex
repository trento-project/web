defmodule Trento.Domain.Events.SapSystemTombstoned do
  @moduledoc """
  This event is emitted when a SAP system is deregistered (decommissioned)
  """

  use Trento.Event

  defevent do
    field :sap_system_id, Ecto.UUID
  end
end
