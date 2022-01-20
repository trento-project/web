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
    :id_cluster,
    :name,
    :type,
    :sid,
    hosts: []
  ]

  @type t :: %__MODULE__{
          id_cluster: String.t(),
          name: [String.t()],
          type: :hana_scale_up | :hana_scale_out | :unknown,
          sid: String.t(),
          hosts: [String.t()]
        }

  # New cluster registered
  def execute(
        %Cluster{id_cluster: nil},
        %RegisterCluster{
          id_cluster: id_cluster,
          id_host: id_host,
          name: name,
          type: type,
          sid: sid
        }
      ) do
    [
      %ClusterRegistered{
        id_cluster: id_cluster,
        name: name,
        type: type,
        sid: sid
      },
      %HostAddedToCluster{
        id_cluster: id_cluster,
        id_host: id_host
      }
    ]
  end

  # Cluster exists but details didn't change
  def execute(
        %Cluster{
          id_cluster: id_cluster,
          type: type,
          sid: sid
        } = cluster,
        %RegisterCluster{
          id_cluster: id_cluster,
          id_host: id_host,
          type: type,
          sid: sid
        }
      ) do
    maybe_emit_host_added_to_cluster_event(cluster, id_host)
  end

  # Cluster exists but details changed
  def execute(
        %Cluster{} = cluster,
        %RegisterCluster{
          id_cluster: id_cluster,
          id_host: id_host,
          name: name,
          type: type,
          sid: sid
        }
      ) do
    [
      %ClusterDetailsUpdated{
        id_cluster: id_cluster,
        name: name,
        type: type,
        sid: sid
      }
    ] ++ maybe_emit_host_added_to_cluster_event(cluster, id_host)
  end

  def apply(
        %Cluster{} = cluster,
        %ClusterRegistered{
          id_cluster: id_cluster,
          name: name,
          type: type,
          sid: sid
        }
      ) do
    %Cluster{
      cluster
      | id_cluster: id_cluster,
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
          id_host: id_host
        }
      ) do
    %Cluster{
      cluster
      | hosts: [id_host | hosts]
    }
  end

  defp maybe_emit_host_added_to_cluster_event(
         %Cluster{id_cluster: id_cluster, hosts: hosts},
         id_host
       ) do
    if id_host in hosts do
      []
    else
      [
        %HostAddedToCluster{
          id_cluster: id_cluster,
          id_host: id_host
        }
      ]
    end
  end
end
