defmodule Trento.Clusters.ValueObjects.HanaClusterDetails do
  @moduledoc """
  Represents the details of a HANA cluster.
  """

  @required_fields [
    :architecture_type,
    :system_replication_mode,
    :system_replication_operation_mode,
    :sr_health_state,
    :fencing_type
  ]

  use Trento.Support.Type

  require Trento.Clusters.Enums.HanaArchitectureType, as: HanaArchitectureType

  alias Trento.Clusters.ValueObjects.{
    ClusterResource,
    HanaClusterNode,
    HanaClusterSite,
    SbdDevice
  }

  deftype do
    field :architecture_type, Ecto.Enum, values: HanaArchitectureType.values()
    field :system_replication_mode, :string
    field :system_replication_operation_mode, :string
    field :secondary_sync_state, :string
    # sr_health_state attribute is deprecated, moved to the sites entry
    field :sr_health_state, :string
    field :fencing_type, :string
    field :maintenance_mode, :boolean

    embeds_many :stopped_resources, ClusterResource
    embeds_many :nodes, HanaClusterNode
    embeds_many :sbd_devices, SbdDevice
    embeds_many :sites, HanaClusterSite
  end
end
