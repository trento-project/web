defmodule Trento.Domain.SaptuneServiceStatus do
  @required_fields [:name]

  use Trento.Type

  deftype do
    field :name, :string
    field :enabled, :string
    field :active, :string
  end
end
