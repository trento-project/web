defmodule Trento.Clusters.Events.ClusterRegistered do
  @moduledoc """
  This event is emitted when a cluster is registered.
  """

  use Trento.Support.Event

  require Trento.Enums.Provider, as: Provider
  require Trento.Clusters.Enums.ClusterType, as: ClusterType
  require Trento.Enums.Health, as: Health

  alias Trento.Clusters.ValueObjects.{
    AscsErsClusterDetails,
    HanaClusterDetails,
    SapInstance
  }

  defevent do
    field :cluster_id, Ecto.UUID
    field :name, :string
    field :type, Ecto.Enum, values: ClusterType.values()
    field :sid, :string
    field :additional_sids, {:array, :string}, default: []
    field :provider, Ecto.Enum, values: Provider.values()
    field :resources_number, :integer
    field :hosts_number, :integer
    field :health, Ecto.Enum, values: Health.values()

    field :details, PolymorphicEmbed,
      types: [
        hana_scale_up: [
          module: HanaClusterDetails,
          identify_by_fields: [:system_replication_mode]
        ],
        ascs_ers: [module: AscsErsClusterDetails, identify_by_fields: [:sap_systems]]
      ],
      on_replace: :update

    embeds_many :sap_instances, SapInstance
  end
end
