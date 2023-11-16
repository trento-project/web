defmodule TestLegacyEvent do
  @moduledoc false

  use Trento.Event

  defevent superseeded_by: TestEvent do
    field :data, :string
  end
end
