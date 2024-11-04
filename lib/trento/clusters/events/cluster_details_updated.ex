defmodule Trento.Clusters.Events.ClusterDetailsUpdated do
  @moduledoc """
  This event is emitted when cluster details are updated.
  """

  use Trento.Support.Event

  require Trento.Enums.Provider, as: Provider
  require Trento.Clusters.Enums.ClusterType, as: ClusterType
  require Trento.Clusters.Enums.HanaScenario, as: HanaScenario

  alias Trento.Clusters.ValueObjects.{
    AscsErsClusterDetails,
    HanaClusterDetails
  }

  defevent do
    field :cluster_id, Ecto.UUID
    field :name, :string
    field :type, Ecto.Enum, values: ClusterType.values()
    field :hana_scenario, Ecto.Enum, values: HanaScenario.values()
    field :sid, :string
    field :additional_sids, {:array, :string}, default: []
    field :provider, Ecto.Enum, values: Provider.values()
    field :resources_number, :integer
    field :hosts_number, :integer

    field :details, PolymorphicEmbed,
      types: [
        hana_scale_up: [
          module: HanaClusterDetails,
          identify_by_fields: [:system_replication_mode]
        ],
        ascs_ers: [module: AscsErsClusterDetails, identify_by_fields: [:sap_systems]]
      ],
      on_replace: :update
  end
end
