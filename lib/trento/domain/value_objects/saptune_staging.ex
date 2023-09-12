defmodule Trento.Domain.SaptuneStaging do
  @required_fields [:id]

  use Trento.Type

  deftype do
    field :enabled, :boolean
    field :notes, {:array, :string}
    field :solutions_ids, {:array, :string}
  end
end
