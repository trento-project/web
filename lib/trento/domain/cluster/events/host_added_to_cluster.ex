defmodule Trento.Domain.Events.HostAddedToCluster do
  @moduledoc """
  This event is emitted when a host is added to a cluster
  """

  use Trento.Event

  defevent do
    field :cluster_id, Ecto.UUID
    field :host_id, Ecto.UUID
  end
end
