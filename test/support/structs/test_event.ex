defmodule TestEvent do
  @moduledoc false

  use Trento.Event

  defevent do
    field :data, :string
  end
end
