defmodule Trento.Domain.Events.SapSystemRolledUp do
  @moduledoc """
  This event is emitted when a sap system roll-up is requested.
  It is used to trigger the stream archiving process and it contains the snapshot of the sap system aggregate.
  """

  use Trento.Event

  defevent resource: "sap_system" do
    field :sap_system_id, Ecto.UUID
    embeds_one :snapshot, Trento.Domain.SapSystem
  end
end
