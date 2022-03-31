defmodule Trento.Integration.Checks.Models.FlatCatalog do
  @moduledoc """
  Flat checks catalog
  """

  @required_fields [
    :checks
  ]

  use Trento.Type

  alias Trento.Integration.Checks.Models.FlatCheck

  deftype do
    embeds_many :checks, FlatCheck
  end
end
