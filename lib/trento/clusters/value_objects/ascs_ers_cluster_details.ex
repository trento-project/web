defmodule Trento.Clusters.ValueObjects.AscsErsClusterDetails do
  @moduledoc """
  Represents the details of a ASCS/ERS cluster.
  """

  @required_fields [
    :fencing_type,
    :sap_systems
  ]

  use Trento.Support.Type

  alias Trento.Clusters.ValueObjects.{
    AscsErsClusterSapSystem,
    ClusterResource,
    SbdDevice
  }

  deftype do
    field :fencing_type, :string
    field :maintenance_mode, :boolean

    embeds_many :sap_systems, AscsErsClusterSapSystem
    # stopped_resources attribute is deprecated, moved to main details
    embeds_many :stopped_resources, ClusterResource
    embeds_many :sbd_devices, SbdDevice
    embeds_many :resources, ClusterResource
  end
end
