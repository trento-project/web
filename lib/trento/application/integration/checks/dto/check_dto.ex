defmodule Trento.Integration.Checks.CheckDto do
  @moduledoc """
  Catalog check
  """

  @required_fields [
    :id,
    :name,
    :description,
    :remediation,
    :implementation,
    :labels
  ]

  use Trento.Type

  deftype do
    field :id, :string
    field :name, :string
    field :description, :string
    field :remediation, :string
    field :implementation, :string
    field :labels, :string
  end
end
