defmodule Trento.Domain.Events.ClusterDetailsUpdated do
  @moduledoc """
  This event is emitted when cluster details are updated.
  """

  use Trento.Event

  alias Trento.Domain.HanaClusterDetails

  defevent do
    field :cluster_id, :string
    field :name, :string
    field :type, Ecto.Enum, values: [:hana_scale_up, :hana_scale_out, :unknown]
    field :sid, :string
    field :provider, Ecto.Enum, values: [:azure, :aws, :gcp, :unknown]
    field :resources_number, :integer
    field :hosts_number, :integer

    embeds_one :details, HanaClusterDetails
  end
end
