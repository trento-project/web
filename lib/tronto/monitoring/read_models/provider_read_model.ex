defmodule Tronto.Monitoring.ProviderReadModel do
  @moduledoc """
  Provider read model
  """

  use Ecto.Schema

  import Ecto.Changeset

  import PolymorphicEmbed, only: [cast_polymorphic_embed: 3]

  alias Tronto.Monitoring.AzureProviderReadModel
  alias Tronto.Monitoring.HostReadModel

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__, :inserted_at, :updated_at]}
  @primary_key false
  schema "providers" do
    field :host_id, Ecto.UUID, primary_key: true
    field :provider, :string

    field :data, PolymorphicEmbed,
      types: [
        azure: AzureProviderReadModel
      ],
      type_field: :provider,
      on_type_not_found: :nilify,
      on_replace: :update

    timestamps()
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(provider_data, attrs) do
    provider_data
    |> cast(attrs, [:host_id, :provider])
    |> cast_polymorphic_embed(:data, required: false)
    |> validate_required(:host_id)
  end
end
