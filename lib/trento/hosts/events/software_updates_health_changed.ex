defmodule Trento.Hosts.Events.SoftwareUpdatesHealthChanged do
  @moduledoc """
  This event is emitted when a host's software updates discovery process complete
  and its calculated health is taken into account in host's aggregated health.
  """

  require Trento.SoftwareUpdates.Enums.SoftwareUpdatesHealth, as: SoftwareUpdatesHealth

  use Trento.Support.Event

  defevent do
    field :host_id, Ecto.UUID
    field :health, Ecto.Enum, values: SoftwareUpdatesHealth.values()
  end
end
