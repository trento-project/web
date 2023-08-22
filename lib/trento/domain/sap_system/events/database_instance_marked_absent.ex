defmodule Trento.Domain.Events.DatabaseInstanceMarkedAbsent do
  @moduledoc """
  This event is emitted when a database instance is marked as absent from the SAP system.
  """

  use Trento.Event

  defevent do
    field :instance_number, :string
    field :host_id, Ecto.UUID
    field :sap_system_id, Ecto.UUID
    field :absent, :utc_datetime_usec
  end
end
