defmodule Trento.Domain.Events.ClusterRollUpRequested do
  @moduledoc """
  This event is emitted when a cluster roll-up is requested.
  It is used to trigger the stream archiving process and it contains the snapshot of the cluster aggregate.
  """

  use Trento.Event

  defevent resource: "cluster" do
    field :cluster_id, Ecto.UUID
    embeds_one :snapshot, Trento.Domain.Cluster
  end
end
