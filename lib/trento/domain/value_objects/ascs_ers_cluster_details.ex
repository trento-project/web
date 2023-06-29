defmodule Trento.Domain.AscsErsClusterDetails do
  @moduledoc """
  Represents the details of a ASCS/ERS cluster.
  """

  @required_fields [
    :fencing_type,
    :sap_systems
  ]

  use Trento.Type

  alias Trento.Domain.{
    AscsErsClusterSapSystem,
    ClusterResource,
    SbdDevice
  }

  deftype do
    field :fencing_type, :string

    embeds_many :sap_systems, AscsErsClusterSapSystem
    embeds_many :stopped_resources, ClusterResource
    embeds_many :sbd_devices, SbdDevice
  end
end
