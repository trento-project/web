defmodule TestRollUpEvent do
  @moduledoc false

  use Trento.Support.Event

  defevent do
    field :snapshot, :map
  end
end
