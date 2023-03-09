defmodule Trento.DeregistrationProcessManager do
  @moduledoc """
    DeregistrationProcessManager is a Commanded ProcessManager, it's the responsible
    for the deregistration procedure for both hosts and clusters.

    This represent a transaction to ensure that the procedure of deregistering hosts and cluster
    follows a certain path and satisfies some requisities.

    For more information see https://hexdocs.pm/commanded/process-managers.html
  """
  use Commanded.ProcessManagers.ProcessManager,
    application: Trento.Commanded,
    name: "deregistration_process_manager"

  @derive Jason.Encoder
  defstruct [
    :host_id
  ]

  alias Trento.DeregistrationProcessManager

  alias Trento.Domain.Events.{
    HostDeregistered,
    HostDeregistrationRequested,
    HostRegistered,
    HostRolledUp
  }

  alias Trento.Domain.Commands.DeregisterHost

  @doc """
    The process manager is interested in HostRegistered which starts or join an existing process
    manager for the host identified with host_id field.
    The process manager is interested in HostDeregistered which stops a process manager for the host identified by host id.

    We consider also the host rollup case, starting a process manager when the host rolled up arrived, so we identify a registered host
    without the HostRegistered event, because that event could be rolled up and then we have to consider also the rolled up host as registered.

    The process manager starts with a Deregistration request and stops when the host is fully deregistered.
  """
  def interested?(%HostRegistered{host_id: host_id}), do: {:start, host_id}
  def interested?(%HostRolledUp{host_id: host_id}), do: {:start, host_id}
  def interested?(%HostDeregistrationRequested{host_id: host_id}), do: {:continue, host_id}
  def interested?(%HostDeregistered{host_id: host_id}), do: {:stop, host_id}
  def interested?(_event), do: false

  def handle(%DeregistrationProcessManager{}, %HostDeregistrationRequested{host_id: host_id}) do
    %DeregisterHost{host_id: host_id}
  end

  def apply(%DeregistrationProcessManager{} = state, %HostRegistered{host_id: host_id}) do
    %DeregistrationProcessManager{state | host_id: host_id}
  end

  def apply(%DeregistrationProcessManager{} = state, %HostRolledUp{host_id: host_id}) do
    %DeregistrationProcessManager{state | host_id: host_id}
  end
end
