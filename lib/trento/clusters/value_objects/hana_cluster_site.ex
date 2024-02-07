defmodule Trento.Clusters.ValueObjects.HanaClusterSite do
  @moduledoc """
  Represents the details of a HANA site.
  """

  @required_fields [
    :name,
    :state,
    :sr_health_state
  ]

  use Trento.Support.Type

  deftype do
    field :name, :string
    field :state, :string
    field :sr_health_state, :string
  end
end
