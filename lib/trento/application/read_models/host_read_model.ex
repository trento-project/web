defmodule Trento.HostReadModel do
  @moduledoc """
  Host read model
  """

  use Ecto.Schema

  import Ecto.Changeset

  import PolymorphicEmbed, only: [cast_polymorphic_embed: 3]

  alias Trento.{
    AzureProviderReadModel,
    ClusterReadModel,
    SlesSubscriptionReadModel
  }

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:id, :binary_id, autogenerate: false}
  schema "hosts" do
    field :hostname, :string
    field :ip_addresses, {:array, :string}
    field :agent_version, :string
    field :cluster_id, Ecto.UUID
    field :heartbeat, Ecto.Enum, values: [:critical, :passing, :unknown]

    field :provider, Ecto.Enum, values: [:azure, :unknown]

    field :provider_data, PolymorphicEmbed,
      types: [
        azure: AzureProviderReadModel
      ],
      type_field: :provider,
      on_type_not_found: :nilify,
      on_replace: :update

    has_one :cluster, ClusterReadModel, references: :cluster_id, foreign_key: :id

    has_many :tags, Trento.Tag, foreign_key: :resource_id

    has_many :sles_subscriptions, SlesSubscriptionReadModel,
      references: :id,
      foreign_key: :host_id
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(host, attrs) do
    host
    |> cast(attrs, List.delete(__MODULE__.__schema__(:fields), :provider_data))
    |> cast_polymorphic_embed(:provider_data, required: false)
  end
end
