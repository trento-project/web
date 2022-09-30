defmodule Trento.Domain.Commands.UpdateProvider do
  @moduledoc """
  Update the provider to a specific host.
  """

  @required_fields [:host_id]

  use Trento.Command

  import PolymorphicEmbed, only: [cast_polymorphic_embed: 3]

  require Trento.Domain.Enums.Provider, as: Provider

  alias Trento.Domain.{
    AwsProvider,
    AzureProvider,
    GcpProvider
  }

  defcommand do
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
