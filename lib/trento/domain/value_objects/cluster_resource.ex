defmodule Trento.Domain.ClusterResource do
  @moduledoc """
  Represents the resource of a HANA cluster.
  """

  @required_fields [
    :id,
    :type,
    :role
  ]

  use Trento.Type

  deftype do
    field :id, :string
    field :type, :string
    field :role, :string
    field :status, :string
    field :fail_count, :integer
  end
end
