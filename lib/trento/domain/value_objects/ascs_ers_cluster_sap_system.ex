defmodule Trento.Domain.AscsErsClusterSapSystem do
  @moduledoc """
  Represents ASCS/ERS cluster SAP system.
  """

  @required_fields [
    :sid,
    :filesystem_resource_based,
    :distributed
  ]

  use Trento.Type

  deftype do
    field :sid, :string
    field :filesystem_resource_based, :boolean
    field :distributed, :boolean
  end
end
