defmodule Tronto.Monitoring.Domain.Commands.UpdateHeartbeat do
  @moduledoc """
    Updated the host heartbeat.
  """

  use TypedStruct
  use Domo

  typedstruct do
    @typedoc "UpdateHeartbeat command"

    field :id_host, String.t(), enforce: true
    field :heartbeat, :passing | :critical, enforce: true
  end

  use Vex.Struct

  validates :id_host, uuid: true
end
