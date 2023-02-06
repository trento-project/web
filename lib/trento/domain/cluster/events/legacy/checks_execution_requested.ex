defmodule Trento.Domain.Events.ChecksExecutionRequested do
  @moduledoc """
  Event of the request of a checks execution.
  """

  use Trento.Event

  require Trento.Domain.Enums.Provider, as: Provider

  defevent do
    field :cluster_id, Ecto.UUID
    field :hosts, {:array, Ecto.UUID}
    field :checks, {:array, :string}
    field :provider, Ecto.Enum, values: Provider.values()
  end
end
