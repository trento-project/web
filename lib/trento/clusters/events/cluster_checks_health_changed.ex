defmodule Trento.Clusters.Events.ClusterChecksHealthChanged do
  @moduledoc """
  This event is emitted when the checks health of a cluster changes.
  """

  use Trento.Support.Event

  require Trento.Enums.Health, as: Health

  defevent do
    field :cluster_id, Ecto.UUID
    field :checks_health, Ecto.Enum, values: Health.values()
  end
end
