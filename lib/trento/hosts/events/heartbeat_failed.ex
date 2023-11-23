defmodule Trento.Hosts.Events.HeartbeatFailed do
  @moduledoc """
  Heartbeat failed event
  """

  use Trento.Support.Event

  defevent do
    field :host_id, Ecto.UUID
  end
end
