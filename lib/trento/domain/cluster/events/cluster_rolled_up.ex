defmodule Trento.Domain.Events.ClusterRolledUp do
  @moduledoc """
  This event is emitted when a cluster is rolled up and its stream is archived.
  It contains the snapshot of the cluster aggregate that will be used to restore the aggregate state.
  """

  use Trento.Event

  alias Trento.Domain.Cluster

  defevent do
    field :cluster_id, Ecto.UUID
    embeds_one :snapshot, Cluster
  end
end
