defmodule Trento.Clusters.ValueObjects.SbdDevice do
  @moduledoc """
  Represents the SBDDevice of a HANA cluster.
  """

  @required_fields :all

  use Trento.Support.Type

  deftype do
    field :device, :string
    field :status, :string
  end
end
