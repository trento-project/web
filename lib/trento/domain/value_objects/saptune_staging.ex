defmodule Trento.Domain.SaptuneStaging do
  @moduledoc """
  Represents the Staging of Saptune.
  """
  @required_fields [:enabled]

  use Trento.Type

  deftype do
    field :enabled, :boolean
    field :notes, {:array, :string}
    field :solutions_ids, {:array, :string}
  end
end
