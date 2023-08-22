defmodule Trento.Domain.Commands.MarkClusterHostAbsent do
  @moduledoc """
  Mark a host in a cluster as absent
  """
  @required_fields :all

  use Trento.Command

  defcommand do
    field :host_id, Ecto.UUID
    field :cluster_id, Ecto.UUID
    field :absent, :utc_datetime_usec
  end
end
