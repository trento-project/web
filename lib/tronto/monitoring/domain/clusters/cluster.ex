defmodule Tronto.Monitoring.Domain.Cluster do
  @moduledoc false

  alias Tronto.Monitoring.Domain.Cluster

  alias Tronto.Monitoring.Domain.Commands.RegisterCluster

  alias Tronto.Monitoring.Domain.Events.{
    ClusterDetailsUpdated,
    ClusterRegistered,
    HostAddedToCluster
  }

  defstruct [
    :cluster_id,
    :name,
    :type,
    :sid,
    hosts: []
  ]

  @type t :: %__MODULE__{
          cluster_id: String.t(),
          name: [String.t()],
          type: :hana_scale_up | :hana_scale_out | :unknown,
          sid: String.t(),
          hosts: [String.t()]
        }

  # New cluster registered
  def execute(
        %Cluster{cluster_id: nil},
        %RegisterCluster{
          cluster_id: cluster_id,
          host_id: host_id,
          name: name,
          type: type,
          sid: sid
        }
      ) do
    [
      %ClusterRegistered{
        cluster_id: cluster_id,
        name: name,
        type: type,
        sid: sid
      },
      %HostAddedToCluster{
        cluster_id: cluster_id,
        host_id: host_id
      }
    ]
  end

  # Cluster exists but details didn't change
  def execute(
        %Cluster{
          cluster_id: cluster_id,
          name: name,
          type: type,
          sid: sid
        } = cluster,
        %RegisterCluster{
          cluster_id: cluster_id,
          host_id: host_id,
          name: name,
          type: type,
          sid: sid
        }
      ) do
    maybe_emit_host_added_to_cluster_event(cluster, host_id)
  end

  # Cluster exists but details changed
  def execute(
        %Cluster{} = cluster,
        %RegisterCluster{
          cluster_id: cluster_id,
          host_id: host_id,
          name: name,
          type: type,
          sid: sid
        }
      ) do
    [
      %ClusterDetailsUpdated{
        cluster_id: cluster_id,
        name: name,
        type: type,
        sid: sid
      }
    ] ++ maybe_emit_host_added_to_cluster_event(cluster, host_id)
  end

  def apply(
        %Cluster{} = cluster,
        %ClusterRegistered{
          cluster_id: cluster_id,
          name: name,
          type: type,
          sid: sid
        }
      ) do
    %Cluster{
      cluster
      | cluster_id: cluster_id,
        name: name,
        type: type,
        sid: sid
    }
  end

  def apply(
        %Cluster{} = cluster,
        %ClusterDetailsUpdated{
          name: name,
          type: type,
          sid: sid
        }
      ) do
    %Cluster{
      cluster
      | name: name,
        type: type,
        sid: sid
    }
  end

  def apply(
        %Cluster{hosts: hosts} = cluster,
        %HostAddedToCluster{
          host_id: host_id
        }
      ) do
    %Cluster{
      cluster
      | hosts: [host_id | hosts]
    }
  end

  defp maybe_emit_host_added_to_cluster_event(
         %Cluster{cluster_id: cluster_id, hosts: hosts},
         host_id
       ) do
    if host_id in hosts do
      []
    else
      [
        %HostAddedToCluster{
          cluster_id: cluster_id,
          host_id: host_id
        }
      ]
    end
  end
end
