defmodule Trento.Domain.Events.HeartbeatFailed do
  @moduledoc """
  Heartbeat failed event
  """

  use Trento.Event

  defevent do
    field :host_id, Ecto.UUID
  end
end
