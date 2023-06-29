defmodule Trento.Domain.Events.ClusterDetailsUpdated do
  @moduledoc """
  This event is emitted when cluster details are updated.
  """

  use Trento.Event

  require Trento.Domain.Enums.Provider, as: Provider
  require Trento.Domain.Enums.ClusterType, as: ClusterType

  alias Trento.Domain.{
    AscsErsClusterDetails,
    HanaClusterDetails
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
