defmodule Trento.Domain.Events.ClusterHealthChanged do
  @moduledoc """
  ClusterHealthChanged event
  """

  use Trento.Event

  require Trento.Domain.Enum.Health, as: Health

  defevent do
    field :cluster_id, :string
    field :health, Ecto.Enum, values: Health.values()
  end
end
