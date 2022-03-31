defmodule Trento.Integration.Checks.GroupDto do
  @moduledoc """
  Catalog entry by group
  """

  @required_fields [
    :group,
    :checks
  ]

  use Trento.Type

  alias Trento.Integration.Checks.CheckDto

  deftype do
    field :group, :string

    embeds_many :checks, CheckDto
  end
end
