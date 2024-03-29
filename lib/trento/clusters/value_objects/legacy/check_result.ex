defmodule Trento.Clusters.ValueObjects.CheckResult do
  @moduledoc """
  Check result value object
  """

  @required_fields [:check_id, :result]

  use Trento.Support.Type

  deftype do
    field :check_id, :string
    field :result, Ecto.Enum, values: [:passing, :warning, :critical, :skipped, :unknown]
  end
end
