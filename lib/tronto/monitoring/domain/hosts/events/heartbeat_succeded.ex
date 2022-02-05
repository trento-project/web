defmodule Tronto.Monitoring.Domain.Events.HeartbeatSucceded do
  @moduledoc """
  Heartbeat succeded event
  """

  use TypedStruct

  @derive Jason.Encoder
  typedstruct do
    @typedoc "HeartbeatSucceded event"

    field :host_id, String.t(), enforce: true
  end
end
