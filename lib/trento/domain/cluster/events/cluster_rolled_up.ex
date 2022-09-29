defmodule Trento.Domain.Events.ClusterRolledUp do
  @moduledoc """
  This event is emitted when a cluster is rolled up and its stream is reset.
  """

  use Trento.Event

  require Trento.Domain.Enum.Provider, as: Provider
  require Trento.Domain.Enum.ClusterType, as: ClusterType

  alias Trento.Domain.{
    HanaClusterDetails,
    HostExecution
  }

  defevent do
    field :cluster_id, :string
    field :name, :string
    field :type, Ecto.Enum, values: ClusterType.values()
    field :sid, :string
    field :provider, Ecto.Enum, values: Provider.values()
    field :resources_number, :integer
    field :hosts_number, :integer
    field :health, Ecto.Enum, values: [:passing, :warning, :critical, :unknown]
    field :hosts, {:array, :string}
    field :selected_checks, {:array, :string}
    field :discovered_health, Ecto.Enum, values: [:passing, :warning, :critical, :unknown]
    field :checks_health, Ecto.Enum, values: [:passing, :warning, :critical, :unknown]

    embeds_one :details, HanaClusterDetails
    embeds_many :hosts_executions, HostExecution

    field :applied, :boolean, default: false
  end
end
