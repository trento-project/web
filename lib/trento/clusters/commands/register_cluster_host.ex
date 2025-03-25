defmodule Trento.Clusters.Commands.RegisterClusterHost do
  @moduledoc """
  Register a cluster node to the monitoring system.
  """

  @required_fields [
    :cluster_id,
    :host_id,
    :type,
    :designated_controller,
    :discovered_health,
    :provider
  ]

  use Trento.Support.Command

  require Trento.Enums.Provider, as: Provider
  require Trento.Clusters.Enums.ClusterType, as: ClusterType
  require Trento.Enums.Health, as: Health

  alias Trento.Clusters.ValueObjects.{
    AscsErsClusterDetails,
    HanaClusterDetails,
    SapInstance
  }

  defcommand do
    field :cluster_id, Ecto.UUID
    field :host_id, Ecto.UUID
    field :name, :string
    field :type, Ecto.Enum, values: ClusterType.values()
    field :provider, Ecto.Enum, values: Provider.values()
    field :designated_controller, :boolean
    field :resources_number, :integer
    field :hosts_number, :integer
    field :discovered_health, Ecto.Enum, values: Health.values()
    field :cib_last_written, :string

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
