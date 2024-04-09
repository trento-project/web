defmodule TestCustomSupersedeEvent do
  @moduledoc false

  def supersede(%{"data" => "new"}), do: TestEvent

  use Trento.Support.Event

  defevent do
    field :data, :string
  end
end
