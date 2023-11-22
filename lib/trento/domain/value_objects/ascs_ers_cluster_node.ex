defmodule Trento.Domain.AscsErsClusterNode do
  @moduledoc """
  Represents the node of a ASCS/ERS cluster.
  """

  @required_fields [
    :name
  ]

  require Trento.Domain.Enums.AscsErsClusterRole, as: AscsErsClusterRole

  use Trento.Support.Type

  alias Trento.Domain.ClusterResource

  deftype do
    field :name, :string
    field :roles, {:array, Ecto.Enum}, values: AscsErsClusterRole.values()
    field :virtual_ips, {:array, :string}
    field :filesystems, {:array, :string}
    field :attributes, {:map, :string}

    embeds_many :resources, ClusterResource
  end
end
