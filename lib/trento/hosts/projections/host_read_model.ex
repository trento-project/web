defmodule Trento.Hosts.Projections.HostReadModel do
  @moduledoc """
  Host read model
  """

  use Ecto.Schema

  import Ecto.Changeset

  require Trento.Enums.Health, as: Health
  require Trento.Enums.Provider, as: Provider

  alias Trento.Clusters.Projections.ClusterReadModel
  alias Trento.Databases.Projections.DatabaseInstanceReadModel
  alias Trento.Hosts.Projections.SlesSubscriptionReadModel
  alias Trento.SapSystems.Projections.ApplicationInstanceReadModel
  alias Trento.Tags.Tag

  defdelegate authorize(action, user, params), to: Trento.Hosts.Policy

  defdelegate authorize_operation(action, host, params),
    to: Trento.Operations.HostPolicy

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:id, :binary_id, autogenerate: false}
  schema "hosts" do
    field :hostname, :string
    field :ip_addresses, {:array, :string}
    field :netmasks, {:array, :integer}
    field :agent_version, :string
    field :fully_qualified_domain_name, :string
    field :heartbeat, Ecto.Enum, values: [:critical, :passing, :unknown]
    field :health, Ecto.Enum, values: Health.values(), default: Health.unknown()
    field :selected_checks, {:array, :string}, default: []
    field :provider, Ecto.Enum, values: Provider.values()
    field :provider_data, :map
    field :saptune_status, Trento.Support.Ecto.Payload, keys_as_atoms: true
    field :prometheus_targets, :map

    has_many :tags, Tag, foreign_key: :resource_id

    has_many :sles_subscriptions, SlesSubscriptionReadModel,
      references: :id,
      foreign_key: :host_id,
      preload_order: [desc: :identifier]

    belongs_to :cluster, ClusterReadModel,
      references: :id,
      foreign_key: :cluster_id,
      type: Ecto.UUID,
      where: [deregistered_at: nil]

    has_many :database_instances, DatabaseInstanceReadModel,
      references: :id,
      foreign_key: :host_id

    has_many :application_instances, ApplicationInstanceReadModel,
      references: :id,
      foreign_key: :host_id

    field :last_heartbeat_timestamp, :utc_datetime_usec, virtual: true

    field :deregistered_at, :utc_datetime_usec
    timestamps(type: :utc_datetime_usec)
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(host, attrs) do
    cast(host, attrs, __MODULE__.__schema__(:fields))
  end
end
