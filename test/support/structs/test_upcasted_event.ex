defmodule TestUpcastedEvent do
  @moduledoc false

  use Trento.Support.Event

  defevent version: 3 do
    field :data, :string
    field :v2_field, :string
    field :v3_field, :string
  end

  def upcast(params, _, 2), do: Map.put(params, "v2_field", "default string for v2 field")
  def upcast(params, _, 3), do: Map.put(params, "v3_field", "default string for v3 field")
end
