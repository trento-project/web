defmodule Trento.SapSystems.Events.SapSystemRolledUp do
  @moduledoc """
  This event is emitted when a sap system roll-up is requested.
  It is used to trigger the stream archiving process and it contains the snapshot of the sap system aggregate.
  """

  alias Trento.Databases.Events.DatabaseRolledUp

  use Trento.Support.Event

  # Supersede the event to DatabaseRolledUp if the snapshot has the old format
  # from events where the sap system and database aggregates were together.
  # If this supersede function matches, the params are upcasted in the
  # DatabaseRolledUp event itself
  def supersede(%{"snapshot" => %{"database" => _}}) do
    DatabaseRolledUp
  end

  defevent resource: "sap_system", version: 2 do
    field :sap_system_id, Ecto.UUID
    embeds_one :snapshot, Trento.SapSystems.SapSystem
  end
end
