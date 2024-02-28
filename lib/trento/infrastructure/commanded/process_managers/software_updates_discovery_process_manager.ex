defmodule Trento.Infrastructure.Commanded.ProcessManagers.SoftwareUpdatesDiscoveryProcessManager do
  @moduledoc """
    todo

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
    HostRegistered,
    HostDetailsUpdated,
    HostRestored,
    HostDeregistered
  }

  alias Trento.Hosts.Commands.{
    MatchSoftwareUpdatesDiscoveryIdentifier
  }

  alias Trento.SapSystems.Commands.{
    DeregisterApplicationInstance,
    DeregisterDatabaseInstance
  }

  alias Trento.Clusters.Commands.DeregisterClusterHost

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

  # on initial host registration
  def handle(
        %SoftwareUpdatesDiscoveryProcessManager{
          host_id: nil,
          fully_qualified_domain_name: nil
        },
        %HostRegistered{
          host_id: host_id,
          fully_qualified_domain_name: fully_qualified_domain_name
        }
      ) do
    IO.puts("on initial host registration")
    maybe_match_software_updates_discovery_identifier(host_id, fully_qualified_domain_name)
  end

  # on host restoration
  def handle(
        %SoftwareUpdatesDiscoveryProcessManager{
          host_id: nil,
          fully_qualified_domain_name: nil
        },
        %HostRestored{
          host_id: host_id
        }
      ) do
    IO.puts("on host restoration")

    # fqdn is not available on host restoration, we need to retrieve it somehow

    # host projector and process manager are concurrent processes.
    # It is not guaranteed that the host projector has projected the host before the process manager
    # options are
    # - let the supervisor restart the process manager and retry
    # - explicitly handle failure and instruct the process to retry until the following query returns a restored host
    # - emit the fqdn in the HostRestored event (needs upcasting)
    # - emit a new event FQDNUpdated from the host aggregate
    host =
      Trento.Hosts.get_host_by_id(host_id)

    IO.inspect(host, label: "host loaded in process manager #{host_id}")

    maybe_match_software_updates_discovery_identifier(host_id, host.fully_qualified_domain_name)
  end

  # Details changed but FQDN did NOT change, ignore
  def handle(
        %SoftwareUpdatesDiscoveryProcessManager{
          host_id: host_id,
          fully_qualified_domain_name: fully_qualified_domain_name
        },
        %HostDetailsUpdated{
          host_id: host_id,
          fully_qualified_domain_name: fully_qualified_domain_name
        }
      ) do
    IO.puts("Details changed but FQDN did NOT change, ignore")

    nil
  end

  # Details changed and FQDN changed as well, re-match
  def handle(
        %SoftwareUpdatesDiscoveryProcessManager{
          host_id: host_id
        },
        %HostDetailsUpdated{
          host_id: host_id,
          fully_qualified_domain_name: fully_qualified_domain_name
        }
      ) do
    IO.puts("Details changed and FQDN changed as well, re-match")

    maybe_match_software_updates_discovery_identifier(host_id, fully_qualified_domain_name)
  end

  # Lift initial state
  def apply(
        %SoftwareUpdatesDiscoveryProcessManager{} = state,
        %HostRegistered{
          host_id: host_id,
          fully_qualified_domain_name: fully_qualified_domain_name
        }
      ) do
    %SoftwareUpdatesDiscoveryProcessManager{
      state
      | host_id: host_id,
        fully_qualified_domain_name: fully_qualified_domain_name
    }
  end

  def apply(
        %SoftwareUpdatesDiscoveryProcessManager{} = state,
        %HostRestored{
          host_id: host_id
          # fully_qualified_domain_name: fully_qualified_domain_name
        }
      ) do
    # We don't have everything we need to update process state here.
    # FQDN is missing
    IO.inspect(state, label: "state in apply HostRestored")

    host =
      Trento.Hosts.get_host_by_id(host_id)

    IO.inspect(host, label: "host found in apply HostRestored")

    %SoftwareUpdatesDiscoveryProcessManager{
      state
      | host_id: host_id,
        fully_qualified_domain_name: host.fully_qualified_domain_name
    }
  end

  # Change the FQDN when necessary
  def apply(
        %SoftwareUpdatesDiscoveryProcessManager{
          fully_qualified_domain_name: previous_fully_qualified_domain_name
        } = state,
        %HostDetailsUpdated{
          fully_qualified_domain_name: new_fully_qualified_domain_name
        }
      )
      when previous_fully_qualified_domain_name != new_fully_qualified_domain_name do
    %SoftwareUpdatesDiscoveryProcessManager{
      state
      | fully_qualified_domain_name: new_fully_qualified_domain_name
    }
  end

  # Retry the rollup errors, stop the process on other errors

  def error({:error, :host_rolling_up}, _command_or_event, %{context: context}),
    do: {:retry, context}

  defp maybe_match_software_updates_discovery_identifier(host_id, fully_qualified_domain_name) do
    # Fake a delay calling SUMA API
    # call to suma might fail, we should handle that
    Process.sleep(1000)

    # sample suma response
    #   {
    #     "success": true,
    #     "result": [
    #         {
    #             "hostname": "vmiscsi01.l15cqsinwnpu5gfyrf1r5l51fe.ax.internal.cloudapp.net",
    #             "ip": "10.90.1.4",
    #             "name": "vmiscsi01.l15cqsinwnpu5gfyrf1r5l51fe.ax.internal.cloudapp.net",
    #             "id": 1000010001,
    #             "last_checkin": "Feb 15, 2024, 5:00:19 AM"
    #         }
    #     ]
    # }

    # fake a system_id coming from SUMA API
    system_id = "#{fully_qualified_domain_name}_#{UUID.uuid4()}"

    %MatchSoftwareUpdatesDiscoveryIdentifier{
      host_id: host_id,
      software_updates_identifier: system_id
    }

    nil
  end
end
