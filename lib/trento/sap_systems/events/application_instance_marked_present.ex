defmodule Trento.SapSystems.Events.ApplicationInstanceMarkedPresent do
  @moduledoc """
  This event is emitted when an application instance is marked as present in the SAP system.
  """

  use Trento.Support.Event

  defevent do
    field :instance_number, :string
    field :host_id, Ecto.UUID
    field :sap_system_id, Ecto.UUID
  end
end
