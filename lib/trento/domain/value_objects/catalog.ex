defmodule Trento.Domain.Catalog do
  @moduledoc """
  Checks catalog entry value object
  """

  @required_fields [
    :provider,
    :groups
  ]

  use Trento.Type

  alias Trento.Domain.CheckCatalogGroup

  deftype do
    field :provider, Ecto.Enum, values: [:azure, :aws, :gcp, :unknown]

    embeds_many  :groups, CheckCatalogGroup
  end
end
