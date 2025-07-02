defmodule Trento.Clusters.ValueObjects.HanaClusterNode do
  @moduledoc """
  Represents the node of a HANA cluster.
  """

  @required_fields [
    :name,
    :hana_status,
    :attributes
  ]

  use Trento.Support.Type

  alias Trento.Clusters.ValueObjects.ClusterResource

  deftype do
    field :name, :string
    field :site, :string
    # hana_status attribute is deprecated, moved to the sites entry
    field :hana_status, :string
    field :attributes, {:map, :string}
    field :virtual_ip, :string
    field :nameserver_actual_role, :string
    field :indexserver_actual_role, :string
    field :status, :string

    # resources attribute is deprecated, moved to main details
    embeds_many :resources, ClusterResource
  end
end
