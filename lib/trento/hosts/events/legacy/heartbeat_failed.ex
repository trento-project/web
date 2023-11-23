defmodule Trento.Domain.Events.HeartbeatFailed do
  @moduledoc """
  Heartbeat failed event
  """

  use Trento.Support.Event

  defevent superseded_by: Trento.Hosts.Events.HeartbeatFailed do
    field :host_id, Ecto.UUID
  end
end
