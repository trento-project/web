defmodule Trento.Domain.CheckResult do
  @moduledoc """
  Check result value object
  """

  @required_fields [:check_id, :result]

  use Trento.Type

  deftype do
    field :check_id, :string
    field :result, Ecto.Enum, values: [:passing, :warning, :critical, :skipped]
  end
end
