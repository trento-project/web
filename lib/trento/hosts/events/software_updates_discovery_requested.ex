defmodule Trento.Hosts.Events.SoftwareUpdatesDiscoveryRequested do
  @moduledoc """
  This event is emitted when a host's software updates discovery process is issued
  """

  use Trento.Support.Event

  defevent do
    field :host_id, Ecto.UUID
    field :fully_qualified_domain_name, :string
  end
end
