defmodule Trento.HostReadModel do
  @moduledoc """
  Host read model
  """

  use Ecto.Schema

  import Ecto.Changeset

  require Trento.Domain.Enums.Provider, as: Provider

  alias Trento.SlesSubscriptionReadModel

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:id, :binary_id, autogenerate: false}
  schema "hosts" do
    field :hostname, :string
    field :ip_addresses, {:array, :string}
    field :agent_version, :string
    field :cluster_id, Ecto.UUID
    field :heartbeat, Ecto.Enum, values: [:critical, :passing, :unknown]

    field :provider, Ecto.Enum, values: Provider.values()
    field :provider_data, :map

    has_many :tags, Trento.Tag, foreign_key: :resource_id

    has_many :sles_subscriptions, SlesSubscriptionReadModel,
      references: :id,
      foreign_key: :host_id,
      preload_order: [desc: :identifier]

    field :deregistered_at, :utc_datetime_usec
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(host, attrs) do
    cast(host, attrs, __MODULE__.__schema__(:fields))
  end
end
