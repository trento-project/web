defmodule Trento.Clusters.Events.HostAddedToCluster do
  @moduledoc """
  This event is emitted when a host is added to a cluster
  """

  use Trento.Support.Event

  require Trento.Clusters.Enums.ClusterHostStatus, as: ClusterHostStatus

  defevent version: 2 do
    field :cluster_id, Ecto.UUID
    field :host_id, Ecto.UUID

    field :cluster_host_status, Ecto.Enum, values: ClusterHostStatus.values()
  end

  # In version 1, the host was added to the cluster only when online.
  # so we can safely assume that the cluster status is online.
  def upcast(params, _, 2), do: Map.put(params, "cluster_host_status", ClusterHostStatus.online())
end
