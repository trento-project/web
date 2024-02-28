defmodule Trento.Hosts.Events.SoftwareUpdatesDiscoveryCompleted do
  @moduledoc """
  This event is emitted when a host's software updates discovery process complete
  """

  alias Trento.Hosts.ValueObjects.RelevantPatches

  use Trento.Support.Event

  defevent do
    field :host_id, Ecto.UUID
    embeds_one :relevant_patches, RelevantPatches
  end
end
