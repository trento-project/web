defmodule Trento.Integration.Checks.CatalogDto do
  @moduledoc """
  Checks catalog
  """

  @required_fields [
    :providers
  ]

  use Trento.Type

  alias Trento.Integration.Checks.ProviderDto

  deftype do
    embeds_many :providers, ProviderDto
  end
end
