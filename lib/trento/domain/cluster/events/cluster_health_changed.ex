defmodule Trento.Domain.Events.ClusterHealthChanged do
  @moduledoc """
  ClusterHealthChanged event
  """

  use Trento.Event

  defevent do
    field :cluster_id, :string
    field :health, Ecto.Enum, values: [:passing, :warning, :critical, :pending]
  end
end
