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

  deftype do
    field :id, :string
    field :type, :string
    field :role, :string
    field :status, :string
    field :fail_count, :integer
    field :managed, :boolean
  end
end
