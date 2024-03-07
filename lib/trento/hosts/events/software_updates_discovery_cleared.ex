defmodule Trento.Hosts.Events.SoftwareUpdatesDiscoveryCleared do
  @moduledoc """
  This event is emitted when a host's software updates discovery is cleared
  """

  use Trento.Support.Event

  defevent do
    field :host_id, Ecto.UUID
  end
end
