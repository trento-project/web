defmodule Trento.SapSystems.Events.DatabaseInstanceMarkedAbsent do
  @moduledoc """
  This event is emitted when a database instance is marked as absent from the SAP system.
  """

  use Trento.Support.Event

  defevent superseded_by: Trento.Databases.Events.DatabaseInstanceMarkedAbsent do
    field :instance_number, :string
    field :host_id, Ecto.UUID
    field :sap_system_id, Ecto.UUID
    field :absent_at, :utc_datetime_usec
  end
end
