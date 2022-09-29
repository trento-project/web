defmodule Trento.Domain.Events.ProviderUpdated do
  @moduledoc """
  This event is emitted when a provider data is updated in a specific host.
  """

  use Trento.Event

  import PolymorphicEmbed, only: [cast_polymorphic_embed: 3]

  require Trento.Domain.Enum.Provider, as: Provider

  alias Trento.Domain.{
    AwsProvider,
    AzureProvider,
    GcpProvider
  }

  defevent do
    field :host_id, Ecto.UUID
    field :provider, Ecto.Enum, values: Provider.values()

    field :provider_data, PolymorphicEmbed,
      types: [
        azure: [module: AzureProvider, identify_by_fields: [:resource_group]],
        aws: [module: AwsProvider, identify_by_fields: [:ami_id]],
        gcp: [module: GcpProvider, identify_by_fields: [:project_id]]
      ],
      on_replace: :update
  end

  def changeset(event, attrs) do
    event
    |> cast(attrs, [:host_id, :provider])
    |> cast_polymorphic_embed(:provider_data, required: false)
  end
end
