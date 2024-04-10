defmodule Trento.Infrastructure.Commanded.EventHandlers.SoftwareUpdatesDiscoveryEventHandler do
  @moduledoc """
  Event handler for software updates discovery related events.

  It triggers the process of discovering software updates for a host when:
  - a host gets registered
  - the fqdn of a host changes
  - when a host gets restored after being deregistered
  """

  use Commanded.Event.Handler,
    application: Trento.Commanded,
    name: "software_updates_discovery_event_handler"

  require Logger

  alias Trento.Hosts.Events.{
    HostDetailsUpdated,
    HostRegistered,
    HostRestored
  }

  alias Trento.Hosts
  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.SoftwareUpdates.Discovery

  def handle(
        %HostRegistered{
          host_id: host_id,
          fully_qualified_domain_name: fully_qualified_domain_name
        },
        _
      )
      when not is_nil(fully_qualified_domain_name) do
    Discovery.discover_host_software_updates(host_id, fully_qualified_domain_name)
    :ok
  end

  def handle(%HostRestored{host_id: host_id}, _) do
    case Hosts.get_host_by_id(host_id) do
      %HostReadModel{id: host_id, fully_qualified_domain_name: fully_qualified_domain_name} ->
        Discovery.discover_host_software_updates(host_id, fully_qualified_domain_name)

      nil ->
        Logger.error("Host not found: #{host_id}")
    end

    :ok
  end

  def handle(
        %HostDetailsUpdated{
          host_id: host_id,
          fully_qualified_domain_name: new_fully_qualified_domain_name
        },
        _
      ) do
    case Hosts.get_host_by_id(host_id) do
      %HostReadModel{
        id: host_id,
        fully_qualified_domain_name: current_fully_qualified_domain_name
      } ->
        discover_or_clear_software_updates(
          host_id,
          current_fully_qualified_domain_name,
          new_fully_qualified_domain_name
        )

      nil ->
        Logger.error("Host not found: #{host_id}")
    end

    :ok
  end

  defp discover_or_clear_software_updates(
         host_id,
         current_fully_qualified_domain_name,
         new_fully_qualified_domain_name
       )
       when current_fully_qualified_domain_name != new_fully_qualified_domain_name and
              is_nil(new_fully_qualified_domain_name),
       do: Discovery.clear_host_software_updates_discovery(host_id)

  defp discover_or_clear_software_updates(
         host_id,
         current_fully_qualified_domain_name,
         new_fully_qualified_domain_name
       )
       when current_fully_qualified_domain_name != new_fully_qualified_domain_name,
       do: Discovery.discover_host_software_updates(host_id, new_fully_qualified_domain_name)

  defp discover_or_clear_software_updates(_, _, _), do: nil
end
