defmodule Trento.Integration.Checks.Models.Catalog do
  @moduledoc """
  Checks catalog
  """

  @required_fields [
    :providers
  ]

  use Trento.Type

  alias Trento.Integration.Checks.Models.Provider

  deftype do
    embeds_many :providers, Provider
  end
end
