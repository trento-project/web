defmodule Trento.Domain.Events.HeartbeatSucceeded do
  @moduledoc """
  Heartbeat succeeded event
  """

  use Trento.Event

  defevent do
    field :host_id, Ecto.UUID
  end
end
