defmodule Trento.Integration.Checks.ProviderDto do
  @moduledoc """
  Catalog entry by provider
  """

  @required_fields [
    :provider,
    :groups
  ]

  use Trento.Type

  alias Trento.Integration.Checks.GroupDto

  deftype do
    field :provider, Ecto.Enum, values: [:azure, :aws, :gcp, :default, :unknown]

    embeds_many :groups, GroupDto
  end
end
