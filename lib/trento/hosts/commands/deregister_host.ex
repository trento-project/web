defmodule Trento.Hosts.Commands.DeregisterHost do
  @moduledoc """
    Deregister a host
  """
  @required_fields :all

  use Trento.Support.Command

  defcommand do
    field :host_id, Ecto.UUID
    field :deregistered_at, :utc_datetime_usec
  end
end
