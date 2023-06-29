defmodule Trento.Domain.AscsErsClusterSapSystem do
  @moduledoc """
  Represents ASCS/ERS cluster SAP system.
  """

  @required_fields [
    :sid,
    :filesystem_resource_based,
    :distributed,
    :nodes
  ]

  use Trento.Type

  alias Trento.Domain.AscsErsClusterNode

  deftype do
    field :sid, :string
    field :filesystem_resource_based, :boolean
    field :distributed, :boolean

    embeds_many :nodes, AscsErsClusterNode
  end
end
