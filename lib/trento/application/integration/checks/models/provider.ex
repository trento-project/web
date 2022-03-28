defmodule Trento.Integration.Checks.Models.Provider do
  @moduledoc """
  Catalog entry by provider
  """

  @required_fields [
    :provider,
    :groups
  ]

  use Trento.Type

  alias Trento.Integration.Checks.Models.Group

  deftype do
    field :provider, Ecto.Enum, values: [:azure, :aws, :gcp, :unknown]

    embeds_many  :groups, Group
  end
end
