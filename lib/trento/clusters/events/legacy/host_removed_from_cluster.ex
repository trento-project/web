defmodule Trento.Domain.Events.HostRemovedFromCluster do
  @moduledoc """
  This event is emitted when a host is removed from a cluster.
  """

  use Trento.Support.Event

  defevent superseded_by: Trento.Clusters.Events.HostRemovedFromCluster do
    field :host_id, Ecto.UUID
    field :cluster_id, Ecto.UUID
    field :deregistered_at, :utc_datetime_usec
  end
end
