defmodule Trento.Domain.Events.ChecksExecutionRequested do
  @moduledoc """
  Event of the request of a checks execution.
  """

  use Trento.Event

  defevent do
    field :cluster_id, Ecto.UUID
    field :hosts, {:array, Ecto.UUID}
    field :checks, {:array, :string}
  end
end
