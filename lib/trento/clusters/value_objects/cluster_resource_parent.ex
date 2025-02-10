defmodule Trento.Clusters.ValueObjects.ClusterResourceParent do
  @moduledoc """
  Represents the parent of a cluster resource

  `managed` represents the maintenance state of the resource.
  `multi_state` represents the type of the group:
    - `true` means a Master/Slave group
    - `false` means a Clone group
    - `nil` means a standard Group
  """

  @required_fields [:id]

  use Trento.Support.Type

  deftype do
    field :id, :string
    field :managed, :boolean
    field :multi_state, :boolean
  end
end
