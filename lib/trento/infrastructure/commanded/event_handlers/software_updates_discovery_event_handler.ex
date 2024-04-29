defmodule Trento.Infrastructure.Commanded.EventHandlers.SoftwareUpdatesDiscoveryEventHandler do
  @moduledoc """
  Event handler for software updates discovery related events.
  Here is where the actual integration with the external system happens and relevant changes in Host are triggered.
  """

  use Commanded.Event.Handler,
    application: Trento.Commanded,
    name: "software_updates_discovery_event_handler"

  alias Trento.Hosts.Events.{
    SoftwareUpdatesDiscoveryCleared,
    SoftwareUpdatesDiscoveryRequested
  }

  alias Trento.SoftwareUpdates.Discovery

  def handle(
        %SoftwareUpdatesDiscoveryRequested{
          host_id: host_id,
          fully_qualified_domain_name: fully_qualified_domain_name
        },
        _
      ) do
    Discovery.discover_host_software_updates(host_id, fully_qualified_domain_name)

    :ok
  end

  def handle(
        %SoftwareUpdatesDiscoveryCleared{
          host_id: host_id
        },
        _
      ),
      do: Discovery.clear_tracked_discovery_result(host_id)
end
