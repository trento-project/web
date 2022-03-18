defmodule Trento.Monitoring.Domain.Commands.UpdateHeartbeat do
  @moduledoc """
  Updated the host heartbeat.
  """

  use TypedStruct
  use Domo

  typedstruct do
    @typedoc "UpdateHeartbeat command"

    field :host_id, String.t(), enforce: true
    field :heartbeat, :passing | :critical, enforce: true
  end

  use Vex.Struct

  validates :host_id, uuid: true
end
