defmodule TestRollUpEvent do
  @moduledoc false

  use Trento.Event

  defevent do
    field :snapshot, :map
  end
end
