defmodule Trento.Integration.Checks.FlatCatalogDto do
  @moduledoc """
  Flat checks catalog
  """

  @required_fields [
    :checks
  ]

  use Trento.Type

  alias Trento.Integration.Checks.FlatCheckDto

  deftype do
    embeds_many :checks, FlatCheckDto
  end
end
