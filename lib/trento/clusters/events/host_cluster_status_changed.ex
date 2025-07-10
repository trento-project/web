defmodule Trento.Clusters.Events.HostClusterStatusChanged do
  @moduledoc """
  When a host's cluster status changes, from online to offline or vice versa,
  """

  use Trento.Support.Event

  defevent do
    field :cluster_id, Ecto.UUID
    field :host_id, Ecto.UUID
    field :cluster_status, Ecto.Enum, values: [:online, :offline]
  end
end
