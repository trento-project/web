defmodule Trento.Domain.Events.ClusterChecksHealthChanged do
  @moduledoc """
  This event is emitted when the checks health of a cluster changes.
  """

  use Trento.Event

  require Trento.Domain.Enums.Health, as: Health

  defevent do
    field :cluster_id, :string
    field :checks_health, Ecto.Enum, values: Health.values()
  end
end
