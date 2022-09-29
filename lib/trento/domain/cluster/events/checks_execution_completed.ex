defmodule Trento.Domain.Events.ChecksExecutionCompleted do
  @moduledoc """
  Event of the checks execution completed.
  """

  use Trento.Event

  require Trento.Domain.Enum.Health, as: Health

  defevent do
    field :cluster_id, Ecto.UUID
    field :health, Ecto.Enum, values: Health.values()
  end
end
