defmodule TestRollupEvent do
  @moduledoc false

  use Trento.Event

  defevent do
    field :data, :string
    field :applied, :boolean, default: false
  end
end
