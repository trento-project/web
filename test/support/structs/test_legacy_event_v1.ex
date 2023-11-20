defmodule TestLegacyEventV1 do
  @moduledoc false

  use Trento.Event

  defevent superseded_by: TestLegacyEventV2 do
    field :data, :string
  end
end
