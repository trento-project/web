defmodule Trento.Hosts.Commands.UpdateHeartbeat do
  @moduledoc """
  Updated the host heartbeat.
  """

  @required_fields :all

  use Trento.Command

  defcommand do
    field :host_id, Ecto.UUID
    field :heartbeat, Ecto.Enum, values: [:passing, :critical]
  end
end
