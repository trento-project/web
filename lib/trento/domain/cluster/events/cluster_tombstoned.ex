defmodule Trento.Domain.Events.ClusterTombstoned do
  @moduledoc """
    This event is emitted after a successful cluster deregistration, to tombstone and stop the cluster aggregate
  """

  use Trento.Event

  defevent do
    field :cluster_id, Ecto.UUID
  end
end
