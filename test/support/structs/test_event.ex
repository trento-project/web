defmodule TestEvent do
  @moduledoc false

  use Trento.Support.Event

  defevent do
    field :data, :string
  end
end
