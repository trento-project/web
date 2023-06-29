defmodule Trento.Domain.Events.ClusterDeregistered do
  @moduledoc """
  This event is emitted when a cluster is deregistered.
  """

  use Trento.Event

  defevent do
    field :cluster_id, Ecto.UUID
    field :deregistered_at, :utc_datetime_usec
  end
end
