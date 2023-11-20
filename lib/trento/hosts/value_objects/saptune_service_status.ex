defmodule Trento.Hosts.SaptuneServiceStatus do
  @moduledoc """
  Represents the status of a Saptune service.
  """
  @required_fields [:name]

  use Trento.Type

  deftype do
    field :name, :string
    field :enabled, :string
    field :active, :string
  end
end
