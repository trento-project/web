defmodule Trento.DeregistrationProcessManager do
  @moduledoc """
    DeregistrationProcessManager is a Commanded ProcessManager, it's the responsible
    for the deregistration procedure for the aggregates

    This represents a transaction to ensure that the procedure of deregistering domain aggregates
    follows a certain path and satisfies some requisities.

    For more information see https://hexdocs.pm/commanded/process-managers.html
  """

  @required_fields :all

  use Trento.Type

  use Commanded.ProcessManagers.ProcessManager,
    application: Trento.Commanded,
    name: "deregistration_process_manager"

  deftype do
    field :cluster_id, Ecto.UUID
  end

  alias Trento.DeregistrationProcessManager

  alias Trento.Domain.Events.{
    ClusterRolledUp,
    HostAddedToCluster,
    HostDeregistered,
    HostDeregistrationRequested,
    HostRegistered,
    HostRolledUp
  }

  alias Trento.Domain.Commands.{
    DeregisterClusterHost,
    DeregisterHost
  }

  @doc """
    The process manager is interested in HostRegistered which starts or joins an existing process
    manager for the host identified by a host_id field.
    The process manager is interested in HostDeregistered which stops a process manager for the host identified by host_id.

    We consider also the host rollup case, starting a process manager when the host rolled up arrived, so we identify a registered host
    without the HostRegistered event, because that event could be rolled up and then we have to consider also the rolled up host as registered.

    The process manager starts with a Deregistration request and stops when the host is fully deregistered.
  """
  def interested?(%HostRegistered{host_id: host_id}), do: {:start, host_id}
  def interested?(%HostRolledUp{host_id: host_id}), do: {:start, host_id}
  def interested?(%HostAddedToCluster{host_id: host_id}), do: {:start, host_id}
  def interested?(%ClusterRolledUp{snapshot: %{hosts: hosts}}), do: {:start, hosts}

  def interested?(%HostDeregistrationRequested{host_id: host_id}), do: {:continue, host_id}

  def interested?(%HostDeregistered{host_id: host_id}), do: {:stop, host_id}

  def interested?(_event), do: false

  # Deregister host that doesn't belong to any cluster
  def handle(%DeregistrationProcessManager{cluster_id: nil}, %HostDeregistrationRequested{
        host_id: host_id,
        requested_at: requested_at
      }) do
    %DeregisterHost{host_id: host_id, deregistered_at: requested_at}
  end

  # First step in host deregistration when host belongs to a cluster
  def handle(%DeregistrationProcessManager{cluster_id: cluster_id}, %HostDeregistrationRequested{
        host_id: host_id,
        requested_at: requested_at
      }) do
    [
      %DeregisterClusterHost{
        host_id: host_id,
        cluster_id: cluster_id,
        deregistered_at: requested_at
      },
      %DeregisterHost{host_id: host_id, deregistered_at: requested_at}
    ]
  end

  def apply(%DeregistrationProcessManager{} = state, %ClusterRolledUp{
        cluster_id: cluster_id
      }) do
    %DeregistrationProcessManager{state | cluster_id: cluster_id}
  end

  def apply(%DeregistrationProcessManager{} = state, %HostAddedToCluster{
        cluster_id: cluster_id
      }) do
    %DeregistrationProcessManager{state | cluster_id: cluster_id}
  end
end
