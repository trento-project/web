defmodule Trento.Domain.Commands.RegisterClusterHost do
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

  use Trento.Command

  require Trento.Domain.Enum.Provider, as: Provider
  require Trento.Domain.Enum.ClusterType, as: ClusterType

  alias Trento.Domain.HanaClusterDetails

  defcommand do
    field :cluster_id, Ecto.UUID
    field :host_id, Ecto.UUID
    field :name, :string
    field :type, Ecto.Enum, values: ClusterType.values()
    field :sid, :string
    field :provider, Ecto.Enum, values: Provider.values()
    field :designated_controller, :boolean
    field :resources_number, :integer
    field :hosts_number, :integer
    field :discovered_health, Ecto.Enum, values: [:passing, :warning, :critical, :unknown]
    field :cib_last_written, :string

    embeds_one :details, HanaClusterDetails
  end
end
