defmodule Trento.Domain.Events.ClusterRolledUp do
  @moduledoc """
  This event is emitted when a cluster is rolled up and its stream is archived.
  It contains the snapshot of the cluster aggregate that will be used to restore the aggregate state.
  """

  use Trento.Support.Event

  alias Trento.Clusters.Cluster

  defevent superseded_by: Trento.Clusters.Events.ClusterRolledUp do
    field :cluster_id, Ecto.UUID
    embeds_one :snapshot, Cluster
  end
end
