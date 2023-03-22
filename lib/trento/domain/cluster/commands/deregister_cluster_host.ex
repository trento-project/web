defmodule Trento.Domain.Commands.DeregisterClusterHost do
  @moduledoc """
    Deregister a cluster host
  """
  @required_fields :all

  use Trento.Command

  defcommand do
    field :host_id, Ecto.UUID
    field :cluster_id, Ecto.UUID
  end
end
