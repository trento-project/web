defmodule Trento.Hosts.ValueObjects.SaptuneNote do
  @moduledoc """
  Represents a SAP note.
  """
  @required_fields [:id, :additionally_enabled]

  use Trento.Support.Type

  deftype do
    field :id, :string
    field :additionally_enabled, :boolean
  end
end
