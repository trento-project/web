defmodule Trento.Domain.Events.SapSystemTombstoned do
  @moduledoc """
  This event is emitted when a SAP system is deregistered (decommissioned) and all the database/application instances
  are also deregistered. This event shutdown the aggregate
  """

  use Trento.Event

  defevent do
    field :sap_system_id, Ecto.UUID
  end
end
