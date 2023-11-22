defmodule Trento.Domain.Events.HeartbeatSucceded do
  @moduledoc """
  Heartbeat succeeded event
  """

  use Trento.Support.Event

  defevent superseded_by: Trento.Hosts.Events.HeartbeatSucceeded do
    field :host_id, Ecto.UUID
  end
end
