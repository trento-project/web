defmodule Trento.Clusters.Projections.ClusterReadModel do
  @moduledoc """
  Cluster read model
  """

  use Ecto.Schema

  import Ecto.Changeset

  require Trento.Enums.Provider, as: Provider
  require Trento.Clusters.Enums.ClusterType, as: ClusterType
  require Trento.Enums.Health, as: Health

  alias Trento.Tags.Tag

  defdelegate authorize(action, user, params), to: Trento.Clusters.Policy

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
    field :details, :map

    has_many :tags, Tag, foreign_key: :resource_id

    # Virtually enriched fields
    field :cib_last_written, :string, virtual: true

    field :deregistered_at, :utc_datetime_usec

    timestamps(type: :utc_datetime_usec)
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(cluster, attrs) do
    cast(cluster, attrs, __MODULE__.__schema__(:fields))
  end
end
