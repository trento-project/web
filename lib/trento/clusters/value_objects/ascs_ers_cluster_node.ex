defmodule Trento.Clusters.ValueObjects.AscsErsClusterNode do
  @moduledoc """
  Represents the node of a ASCS/ERS cluster.
  """

  @required_fields [
    :name
  ]

  require Trento.Clusters.Enums.AscsErsClusterRole, as: AscsErsClusterRole

  use Trento.Support.Type

  alias Trento.Clusters.ValueObjects.ClusterResource

  deftype do
    field :name, :string
    field :roles, {:array, Ecto.Enum}, values: AscsErsClusterRole.values()
    field :virtual_ips, {:array, :string}
    field :filesystems, {:array, :string}
    field :attributes, {:map, :string}
    field :status, :string

    # resources attribute is deprecated, moved to main details
    embeds_many :resources, ClusterResource
  end
end
