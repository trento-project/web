defmodule TestData do
  @moduledoc false

  @required_fields :all

  use Trento.Type

  deftype do
    field :id, Ecto.UUID
    field :name, :string
    embeds_one :embedded, EmbeddedTestData

    field :polymorphic, PolymorphicEmbed,
      types: [
        address: [module: PolymorphicAddressTestData, identify_by_fields: [:address]],
        phone: [module: PolymorphicPhoneTestData, identify_by_fields: [:phone]]
      ],
      on_replace: :update
  end
end

defmodule EmbeddedTestData do
  @moduledoc false

  @required_fields :all

  use Trento.Type

  deftype do
    field :id, Ecto.UUID
    field :name, :string
  end
end

defmodule PolymorphicAddressTestData do
  @moduledoc false

  @required_fields :all

  use Trento.Type

  deftype do
    field :id, Ecto.UUID
    field :address, :string
  end
end

defmodule PolymorphicPhoneTestData do
  @moduledoc false

  @required_fields :all

  use Trento.Type

  deftype do
    field :id, Ecto.UUID
    field :phone, :string
  end
end
