defmodule Trento.Domain.Commands.DeregisterClusterHost do
  @moduledoc """
  Deregister a host from a cluster
  """
  @required_fields :all

  use Trento.Command

  defcommand do
    field :host_id, Ecto.UUID
    field :cluster_id, Ecto.UUID
    field :deregistered_at, :utc_datetime_usec
  end
end
