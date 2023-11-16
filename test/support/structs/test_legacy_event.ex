defmodule TestLegacyEvent do
  @moduledoc false

  use Trento.Event

  defevent superseded_by: TestEvent do
    field :data, :string
  end
end
