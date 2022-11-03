defmodule Trento.Domain.Events.ClusterHealthChanged do
  @moduledoc """
  ClusterHealthChanged event
  """

  use Trento.Event

  require Trento.Domain.Enums.Health, as: Health

  defevent do
    field :cluster_id, Ecto.UUID
    field :health, Ecto.Enum, values: Health.values()
  end
end
