defmodule Trento.Domain.Events.ChecksExecutionStarted do
  @moduledoc """
  Event of emitted when a checks execution is started.
  """

  use Trento.Event

  defevent do
    field :cluster_id, Ecto.UUID
  end
end
