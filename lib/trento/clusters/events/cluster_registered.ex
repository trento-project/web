# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Clusters.Events.ClusterRegistered do
  @moduledoc """
  This event is emitted when a cluster is registered.
  """

  use Trento.Support.Event

  require Trento.Enums.Provider, as: Provider
  require Trento.Clusters.Enums.ClusterType, as: ClusterType
  require Trento.Clusters.Enums.ClusterState, as: ClusterState
  require Trento.Enums.Health, as: Health

  alias Trento.Clusters.ValueObjects.{
    AscsErsClusterDetails,
    AscsErsClusterHealthDetails,
    HanaClusterDetails,
    HanaClusterHealthDetails,
    SapInstance
  }

  defevent version: 4 do
    field :cluster_id, Ecto.UUID
    field :name, :string
    field :type, Ecto.Enum, values: ClusterType.values()
    field :provider, Ecto.Enum, values: Provider.values()
    field :resources_number, :integer
    field :hosts_number, :integer
    field :health, Ecto.Enum, values: Health.values()
    field :state, Ecto.Enum, values: ClusterState.values()

    polymorphic_embeds_one(:details,
      types: [
        hana_scale_up: [
          module: HanaClusterDetails,
          identify_by_fields: [:system_replication_mode]
        ],
        ascs_ers: [module: AscsErsClusterDetails, identify_by_fields: [:sap_systems]]
      ],
      on_replace: :update
    )

    polymorphic_embeds_one(:health_details,
      types: [
        hana_scale_up: HanaClusterHealthDetails,
        hana_scale_out: HanaClusterHealthDetails,
        ascs_ers: AscsErsClusterHealthDetails
      ],
      on_replace: :update,
      use_parent_field_for_type: :type,
      on_type_not_found: :nilify
    )

    embeds_many :sap_instances, SapInstance
  end

  def upcast(params, _, 2), do: Map.put(params, "state", ClusterState.unknown())

  def upcast(%{"health" => health, "type" => type} = params, _, 3)
      when type in ["hana_scale_up", "hana_scale_out"],
      do: Map.put(params, "health_details", %{"replication_health" => health})

  def upcast(%{"health" => health, "type" => "ascs_ers"} = params, _, 3),
    do: Map.put(params, "health_details", %{"distributed_health" => health})

  def upcast(params, _, 3), do: Map.put(params, "health_details", nil)

  def upcast(params, _, 4) do
    :TODO
  end
end
