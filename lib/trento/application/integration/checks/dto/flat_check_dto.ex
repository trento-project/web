defmodule Trento.Integration.Checks.FlatCheckDto do
  @moduledoc """
  Flat catalog check
  """

  @required_fields [
    :id,
    :provider,
    :group,
    :name,
    :description,
    :remediation,
    :implementation,
    :labels
  ]

  use Trento.Type

  deftype do
    field :id, :string
    field :provider, Ecto.Enum, values: [:azure, :aws, :gcp, :dev, :unknown]
    field :group, :string
    field :name, :string
    field :description, :string
    field :remediation, :string
    field :implementation, :string
    field :labels, :string
  end
end
