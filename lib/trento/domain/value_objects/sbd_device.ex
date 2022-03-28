defmodule Trento.Domain.SbdDevice do
  @moduledoc """
  Represents the SBDDevice of a HANA cluster.
  """

  @required_fields :all

  use Trento.Type

  deftype do
    field :device, :string
    field :status, :string
  end
end
