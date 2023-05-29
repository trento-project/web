defmodule Trento.Domain.AscsErsClusterNode do
  @moduledoc """
  Represents the node of a ASCS/ERS cluster.
  """

  @required_fields [
    :name
  ]

  use Trento.Type

  alias Trento.Domain.ClusterResource

  deftype do
    field :name, :string
    field :roles, {:array, Ecto.Enum}, values: [:ascs, :ers]
    field :virtual_ips, {:array, :string}
    field :filesystems, {:array, :string}
    field :attributes, {:map, :string}

    embeds_many :resources, ClusterResource
  end
end
