defmodule Trento.Infrastructure.Commanded.ProcessManagers.SoftwareUpdatesDiscoveryProcessManager do
  @moduledoc """
  Process Manager for Software Updates Discovery.
  It triggers the process of discovering software updates for a host when:
  - a host gets registered
  - the fqdn of a host changes
  - when a host gets restored after being deregistered

  For more information see https://hexdocs.pm/commanded/process-managers.html
  """

  use Commanded.ProcessManagers.ProcessManager,
    application: Trento.Commanded,
    name: "software_updates_discovery_process_manager"

  alias Trento.Infrastructure.Commanded.ProcessManagers.SoftwareUpdatesDiscoveryProcessManager

  @required_fields []
  use Trento.Support.Type

  deftype do
    field :host_id, Ecto.UUID
    field :fully_qualified_domain_name, :string
  end

  alias Trento.Hosts.Events.{
    HostDeregistered,
    HostDetailsUpdated,
    HostRegistered,
    HostRestored
  }

  alias Trento.Hosts.Commands.{
    ClearSoftwareUpdatesDiscovery,
    DiscoverSoftwareUpdates
  }

  # Start the Process Manager
  def interested?(%HostRegistered{host_id: host_id}),
    do: {:start, host_id}

  def interested?(%HostRestored{host_id: host_id}),
    do: {:start, host_id}

  # Continue the Process Manager
  def interested?(%HostDetailsUpdated{host_id: host_id}),
    do: {:continue, host_id}

  # Stop the Process Manager
  def interested?(%HostDeregistered{host_id: host_id}),
    do: {:stop, host_id}

  def interested?(_event), do: false

  # on host registration, if the registered host has an FQDN, trigger the software updates discovery
  def handle(
        %SoftwareUpdatesDiscoveryProcessManager{
          host_id: nil,
          fully_qualified_domain_name: nil
        },
        %HostRegistered{
          host_id: host_id,
          fully_qualified_domain_name: fully_qualified_domain_name
        }
      )
      when not is_nil(fully_qualified_domain_name),
      do: %DiscoverSoftwareUpdates{host_id: host_id}

  # on host restoration, trigger the software updates discovery
  def handle(
        %SoftwareUpdatesDiscoveryProcessManager{
          host_id: nil,
          fully_qualified_domain_name: nil
        },
        %HostRestored{host_id: host_id}
      ),
      do: %DiscoverSoftwareUpdates{host_id: host_id}

  # when host details changed but FQDN did NOT change, ignore
  def handle(
        %SoftwareUpdatesDiscoveryProcessManager{
          host_id: host_id,
          fully_qualified_domain_name: fully_qualified_domain_name
        },
        %HostDetailsUpdated{
          host_id: host_id,
          fully_qualified_domain_name: fully_qualified_domain_name
        }
      ),
      do: []

  # when FQDN changes to nil, clear the software updates discovery
  def handle(
        %SoftwareUpdatesDiscoveryProcessManager{
          host_id: host_id,
          fully_qualified_domain_name: current_fully_qualified_domain_name
        },
        %HostDetailsUpdated{
          host_id: host_id,
          fully_qualified_domain_name: new_fully_qualified_domain_name
        }
      )
      when current_fully_qualified_domain_name != new_fully_qualified_domain_name and
             is_nil(new_fully_qualified_domain_name),
      do: %ClearSoftwareUpdatesDiscovery{host_id: host_id}

  # when FQDN changes, re-trigger the software updates discovery
  def handle(
        %SoftwareUpdatesDiscoveryProcessManager{
          host_id: host_id,
          fully_qualified_domain_name: current_fully_qualified_domain_name
        },
        %HostDetailsUpdated{
          host_id: host_id,
          fully_qualified_domain_name: new_fully_qualified_domain_name
        }
      )
      when current_fully_qualified_domain_name != new_fully_qualified_domain_name,
      do: %DiscoverSoftwareUpdates{host_id: host_id}

  def apply(
        %SoftwareUpdatesDiscoveryProcessManager{} = state,
        %HostRegistered{
          host_id: host_id,
          fully_qualified_domain_name: fully_qualified_domain_name
        }
      ),
      do: %SoftwareUpdatesDiscoveryProcessManager{
        state
        | host_id: host_id,
          fully_qualified_domain_name: fully_qualified_domain_name
      }

  def apply(
        %SoftwareUpdatesDiscoveryProcessManager{} = state,
        %HostRestored{
          host_id: host_id
        }
      ),
      do: %SoftwareUpdatesDiscoveryProcessManager{
        state
        | host_id: host_id
      }

  def apply(
        %SoftwareUpdatesDiscoveryProcessManager{} = state,
        %HostDetailsUpdated{
          fully_qualified_domain_name: new_fully_qualified_domain_name
        }
      ),
      do: %SoftwareUpdatesDiscoveryProcessManager{
        state
        | fully_qualified_domain_name: new_fully_qualified_domain_name
      }
end
