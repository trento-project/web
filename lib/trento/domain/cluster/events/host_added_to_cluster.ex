defmodule Trento.Domain.Events.HostAddedToCluster do
  @moduledoc """
  This event is emitted when a host is added to a cluster
  """

  use Trento.Event

  defevent do
    field :cluster_id, :string
    field :host_id, :string
  end
end
