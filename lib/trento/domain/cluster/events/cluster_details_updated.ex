defmodule Trento.Domain.Events.ClusterDetailsUpdated do
  @moduledoc """
  This event is emitted when cluster details are updated.
  """

  use Trento.Event

  require Trento.Domain.Enum.Provider, as: Provider
  require Trento.Domain.Enum.ClusterType, as: ClusterType

  alias Trento.Domain.HanaClusterDetails

  defevent do
    field :cluster_id, :string
    field :name, :string
    field :type, Ecto.Enum, values: ClusterType.values()
    field :sid, :string
    field :provider, Ecto.Enum, values: Provider.values()
    field :resources_number, :integer
    field :hosts_number, :integer

    embeds_one :details, HanaClusterDetails
  end
end
