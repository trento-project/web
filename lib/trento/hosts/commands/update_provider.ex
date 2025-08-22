defmodule Trento.Hosts.Commands.UpdateProvider do
  @moduledoc """
  Update the provider to a specific host.
  """

  @required_fields [:host_id]

  use Trento.Support.Command

  require Trento.Enums.Provider, as: Provider

  alias Trento.Hosts.ValueObjects.{
    AwsProvider,
    AzureProvider,
    GcpProvider
  }

  defcommand do
    field :host_id, Ecto.UUID
    field :provider, Ecto.Enum, values: Provider.values()

    polymorphic_embeds_one(:provider_data,
      types: [
        azure: [module: AzureProvider, identify_by_fields: [:resource_group]],
        aws: [module: AwsProvider, identify_by_fields: [:ami_id]],
        gcp: [module: GcpProvider, identify_by_fields: [:project_id]]
      ],
      on_replace: :update
    )
  end

  def changeset(event, attrs) do
    event
    |> cast(attrs, [:host_id, :provider])
    |> cast_polymorphic_embed(:provider_data, required: false)
  end
end
