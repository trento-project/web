defmodule Trento.Domain.Commands.UpdateHeartbeat do
  @moduledoc """
  Updated the host heartbeat.
  """

  @required_fields :all

  use Trento.Command

  defcommand do
    field :host_id, :string
    field :heartbeat, Ecto.Enum, values: [:passing, :critical]
  end
end
