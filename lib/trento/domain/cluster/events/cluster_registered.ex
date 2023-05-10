defmodule Trento.Domain.Events.ClusterRegistered do
  @moduledoc """
  This event is emitted when a cluster is registered.
  """

  use Trento.Event

  require Trento.Domain.Enums.Provider, as: Provider
  require Trento.Domain.Enums.ClusterType, as: ClusterType
  require Trento.Domain.Enums.Health, as: Health

  alias Trento.Domain.HanaClusterDetails

  defevent do
    field :cluster_id, Ecto.UUID
    field :name, :string
    field :type, Ecto.Enum, values: ClusterType.values()
    field :sid, :string
    field :additional_sids, {:array, :string}
    field :provider, Ecto.Enum, values: Provider.values()
    field :resources_number, :integer
    field :hosts_number, :integer
    field :health, Ecto.Enum, values: Health.values()

    embeds_one :details, HanaClusterDetails
  end
end
