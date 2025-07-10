defmodule Trento.Clusters.Commands.RegisterOfflineClusterHost do
  @moduledoc """
  Command to register a host in a cluster when the host is offline.
  """

  @required_fields [
    :cluster_id,
    :host_id
  ]

  use Trento.Support.Command

  defcommand do
    field :cluster_id, Ecto.UUID
    field :host_id, Ecto.UUID
    field :name, :string
  end
end
