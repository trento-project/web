defmodule Trento.Domain.Events.HeartbeatSucceded do
  @moduledoc """
  Heartbeat succeeded event
  """

  use Trento.Event

  defevent superseeded_by: Trento.Hosts.Events.HeartbeatSucceded do
    field :host_id, Ecto.UUID
  end
end
