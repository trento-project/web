defmodule Trento.Clusters.ValueObjects.ClusterResource do
  @moduledoc """
  Represents the resource of a HANA cluster.
  """

  @required_fields [
    :id,
    :type,
    :role
  ]

  use Trento.Support.Type

  alias Trento.Clusters.ValueObjects.ClusterResourceParent

  deftype do
    field :id, :string
    field :type, :string
    field :role, :string
    field :status, :string
    field :fail_count, :integer
    field :managed, :boolean
    field :node, :string
    field :sid, :string

    embeds_one :parent, ClusterResourceParent
  end
end
