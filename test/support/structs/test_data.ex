defmodule TestData do
  @moduledoc false

  @required_fields []

  use Trento.Type

  deftype do
    field :id, Ecto.UUID
    field :name, :string
    embeds_one :embedded, EmbeddedTestData
  end
end

defmodule EmbeddedTestData do
  @moduledoc false

  @required_fields []

  use Trento.Type

  deftype do
    field :id, Ecto.UUID
    field :name, :string
  end
end
