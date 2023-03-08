defmodule Trento.Domain.Host.Commands.DeregisterHost do
  @moduledoc """
    Deregister a host
  """
  @required_fields :all

  use Trento.Command

  defcommand do
    field :host_id, Ecto.UUID
  end
end
