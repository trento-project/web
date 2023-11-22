defmodule Trento.Domain.Events.ApplicationInstanceMarkedAbsent do
  @moduledoc """
  This event is emitted when an application instance is marked as absent from the SAP system.
  """

  use Trento.Event

  defevent superseded_by: Trento.SapSystems.Events.ApplicationInstanceMarkedAbsent do
    field :instance_number, :string
    field :host_id, Ecto.UUID
    field :sap_system_id, Ecto.UUID
    field :absent_at, :utc_datetime_usec
  end
end
