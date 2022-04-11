defmodule Trento.Domain.Events.ClusterRegistered do
  @moduledoc """
  This event is emitted when a cluster is registered.
  """

  use Trento.Event

  alias Trento.Domain.HanaClusterDetails

  defevent do
    field :cluster_id, :string
    field :name, :string
    field :type, Ecto.Enum, values: [:hana_scale_up, :hana_scale_out, :unknown]
    field :sid, :string
    field :resources_number, :integer
    field :hosts_number, :integer
    field :health, Ecto.Enum, values: [:passing, :warning, :critical, :unknown]

    embeds_one :details, HanaClusterDetails
  end
end
