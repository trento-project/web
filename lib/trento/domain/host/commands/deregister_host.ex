defmodule Trento.Domain.Commands.DeregisterHost do
  @moduledoc """
    Deregister a host
  """
  @required_fields :all

  use Trento.Command

  defcommand do
    field :host_id, Ecto.UUID
    field :deregistered_at, :utc_datetime_usec, default: DateTime.utc_now()
  end
end
