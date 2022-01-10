defmodule Tronto.Monitoring.Domain.Events.HeartbeatFailed do
  @moduledoc """
    Heartbeat failed event
  """

  use TypedStruct

  @derive Jason.Encoder
  typedstruct do
    @typedoc "HeartbeatFailed event"

    field :id_host, String.t(), enforce: true
  end
end
