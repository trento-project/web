defmodule Trento.Clusters.ValueObjects.ClusterResourceParent do
  @moduledoc """
  Represents the parent of a cluste resource
  """

  @required_fields [:id]

  use Trento.Support.Type

  deftype do
    field :id, :string
    field :managed, :boolean
    field :multi_state, :boolean
  end
end
