defmodule Trento.Integration.Checks.Models.Group do
  @moduledoc """
  Catalog entry by group
  """

  @required_fields [
    :group,
    :checks
  ]

  use Trento.Type

  alias Trento.Integration.Checks.Models.Check

  deftype do
    field :group, :string

    embeds_many  :checks, Check
  end
end
