defmodule Trento.Domain.SaptuneServiceStatus do
  @required_fields [:enabled, :active, :name]

  use Trento.Type

  deftype do
    field :name, :string
    field :enabled, :boolean
    field :active, :boolean
  end
end
