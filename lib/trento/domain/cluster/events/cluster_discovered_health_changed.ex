defmodule Trento.Domain.Events.ClusterDiscoveredHealthChanged do
  @moduledoc """
  This event is emitted when the discovered health of a cluster changes.
  """

  use Trento.Event

  require Trento.Domain.Enum.Health, as: Health

  defevent do
    field :cluster_id, :string
    field :discovered_health, Ecto.Enum, values: Health.values()
  end
end
