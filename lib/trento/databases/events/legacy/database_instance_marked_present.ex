defmodule Trento.SapSystems.Events.DatabaseInstanceMarkedPresent do
  @moduledoc """
  This event is emitted when a database instance is marked as present in the SAP system.
  """

  use Trento.Support.Event

  defevent superseded_by: Trento.Databases.Events.DatabaseInstanceMarkedPresent do
    field :instance_number, :string
    field :host_id, Ecto.UUID
    field :sap_system_id, Ecto.UUID
  end
end
