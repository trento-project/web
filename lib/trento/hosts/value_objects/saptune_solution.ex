defmodule Trento.Hosts.ValueObjects.SaptuneSolution do
  @moduledoc """
  Represents a Saptune solution
  """
  @required_fields [:id]

  use Trento.Type

  deftype do
    field :id, :string
    field :notes, {:array, :string}
    field :partial, :boolean
  end
end
