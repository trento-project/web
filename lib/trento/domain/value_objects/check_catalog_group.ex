defmodule Trento.Domain.CheckCatalogGroup do
  @moduledoc """
  Checks catalog entry value object
  """

  @required_fields [
    :group,
    :checks
  ]

  use Trento.Type

  alias Trento.Domain.CheckCatalog

  deftype do
    field :group, :string

    embeds_many  :checks, CheckCatalog
  end
end
