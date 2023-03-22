defmodule Trento.Domain.Events.HostRemovedFromCluster do
  @moduledoc """
    This event is emitted when a host is removed from a cluster.
  """

  use Trento.Event

  defevent do
    field :host_id, Ecto.UUID
    field :cluster_id, Ecto.UUID
    field :deregistered_at, :utc_datetime_usec
  end
end
