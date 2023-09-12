defmodule Trento.Domain.SaptuneNote do
  @required_fields [:id, :additionally_enabled]

  use Trento.Type

  deftype do
    field :id, :string
    field :additionally_enabled, :boolean
  end
end
