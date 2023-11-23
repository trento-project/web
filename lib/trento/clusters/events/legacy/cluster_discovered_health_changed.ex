defmodule Trento.Domain.Events.ClusterDiscoveredHealthChanged do
  @moduledoc """
  This event is emitted when the discovered health of a cluster changes.
  """

  use Trento.Support.Event

  require Trento.Domain.Enums.Health, as: Health

  defevent superseded_by: Trento.Clusters.Events.ClusterDiscoveredHealthChanged do
    field :cluster_id, Ecto.UUID
    field :discovered_health, Ecto.Enum, values: Health.values()
  end
end
