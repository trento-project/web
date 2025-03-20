defmodule Trento.Clusters.Projections.ClusterReadModel do
  @moduledoc """
  Cluster read model
  """

  use Ecto.Schema

  import Ecto.Changeset

  require Trento.Enums.Provider, as: Provider
  require Trento.Clusters.Enums.ClusterType, as: ClusterType
  require Trento.Enums.Health, as: Health

  alias Trento.Hosts.Projections.HostReadModel

  alias Trento.Clusters.ValueObjects.SapInstance

  alias Trento.Tags.Tag

  defdelegate authorize(action, user, params), to: Trento.Clusters.Policy

  defdelegate authorize_operation(action, application_instance, params),
    to: Trento.Operations.ClusterPolicy

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:id, :binary_id, autogenerate: false}
  schema "clusters" do
    field :name, :string, default: ""
    field :sid, :string
    field :additional_sids, {:array, :string}, default: []
    field :provider, Ecto.Enum, values: Provider.values()
    field :type, Ecto.Enum, values: ClusterType.values()
    field :selected_checks, {:array, :string}, default: []
    field :health, Ecto.Enum, values: Health.values()
    field :resources_number, :integer
    field :hosts_number, :integer
    field :details, Trento.Support.Ecto.Payload, keys_as_atoms: true

    has_many :tags, Tag, foreign_key: :resource_id

    has_many :hosts, HostReadModel,
      references: :id,
      foreign_key: :cluster_id,
      where: [deregistered_at: nil]

    embeds_many :sap_instances, SapInstance, on_replace: :delete

    # Virtually enriched fields
    field :cib_last_written, :string, virtual: true

    field :deregistered_at, :utc_datetime_usec

    timestamps(type: :utc_datetime_usec)
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(cluster, attrs) do
    cluster
    |> cast(attrs, __MODULE__.__schema__(:fields) -- [:sap_instances])
    |> cast_embed(:sap_instances)
  end
end
