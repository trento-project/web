defmodule Trento.Domain.SaptuneSolution do
  @required_fields [:id]

  use Trento.Type

  deftype do
    field :id, :string
    field :notes, {:array, :string}
    field :partial, :boolean
  end
end
