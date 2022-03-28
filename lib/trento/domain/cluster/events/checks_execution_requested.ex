defmodule Trento.Domain.Events.ChecksExecutionRequested do
  @moduledoc """
  Event of the request of a checks execution.
  """

  use Trento.Event

  defevent do
    field :cluster_id, :string
    field :hosts, {:array, :string}
    field :checks, {:array, :string}
  end
end
