defmodule Trento.Clusters.Events.ClusterHealthChanged do
  @moduledoc """
  ClusterHealthChanged event
  """

  use Trento.Support.Event

  require Trento.Enums.Health, as: Health

  defevent do
    field :cluster_id, Ecto.UUID
    field :health, Ecto.Enum, values: Health.values()
  end
end
