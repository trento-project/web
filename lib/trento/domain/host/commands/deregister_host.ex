defmodule Trento.Domain.Host.Commands.DeregisterHost do
  @moduledoc """
    Deregister a host
  """
  use Trento.Command

  @required_fields :all

  defcommand do
    field :host_id, Ecto.UUID
  end
end
