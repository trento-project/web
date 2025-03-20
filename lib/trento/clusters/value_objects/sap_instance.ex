defmodule Trento.Clusters.ValueObjects.SapInstance do
  @moduledoc """
  Clustered SAP instance
  """
  @required_fields [:name, :sid, :instance_number, :resource_type]

  use Trento.Support.Type

  require Trento.Clusters.Enums.SapInstanceResourceType, as: SapInstanceResourceType

  deftype do
    field :name, :string
    field :sid, :string
    field :instance_number, :string
    field :hostname, :string
    field :resource_type, Ecto.Enum, values: SapInstanceResourceType.values()
  end
end
