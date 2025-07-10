defmodule Trento.Clusters.Events.ClusterHostStatusChanged do
  @moduledoc """
  When a host's cluster status changes, from online to offline or vice versa,
  """

  use Trento.Support.Event

  require Trento.Clusters.Enums.ClusterHostStatus, as: ClusterHostStatus

  defevent do
    field :cluster_id, Ecto.UUID
    field :host_id, Ecto.UUID

    field :cluster_host_status, Ecto.Enum,
      values: [ClusterHostStatus.online(), ClusterHostStatus.offline()]
  end
end
