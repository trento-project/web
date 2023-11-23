defmodule Trento.Domain.Events.ClusterTombstoned do
  @moduledoc """
    This event is emitted after a successful cluster deregistration, to tombstone and stop the cluster aggregate
  """

  use Trento.Support.Event

  defevent superseded_by: Trento.Clusters.Events.ClusterTombstoned do
    field :cluster_id, Ecto.UUID
  end
end
