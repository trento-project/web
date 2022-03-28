defmodule Trento.Domain.CheckCatalog do
  @moduledoc """
  Checks catalog entry value object
  """

  @required_fields [
    :check_id,
    :name,
    :description,
    :remediation,
    :implementation,
    :labels
  ]

  use Trento.Type

  deftype do
    field :check_id, :string
    field :name, :string
    field :description, :string
    field :remediation, :string
    field :implementation, :string
    field :labels, :string
  end
end
