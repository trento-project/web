defmodule Trento.Domain.Events.ClusterRollupFailed do
  @moduledoc """
  Event emitted when a cluster rollup has failed
  """

  use Trento.Event

  defevent do
    field :cluster_id, Ecto.UUID
  end
end
