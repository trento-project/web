defmodule Trento.Databases.Projections.DatabaseReadModel do
  @moduledoc """
  Database read model
  """

  use Ecto.Schema

  import Ecto.Changeset

  require Trento.Enums.Health, as: Health

  alias Trento.Databases.Projections.DatabaseInstanceReadModel
  alias Trento.Databases.ValueObjects.Tenant
  alias Trento.SapSystems.Projections.SapSystemReadModel

  alias Trento.Tags.Tag

  defdelegate authorize(action, user, params), to: Trento.Databases.Policy

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:id, :binary_id, autogenerate: false}
  schema "databases" do
    field :sid, :string
    field :health, Ecto.Enum, values: Health.values()

    embeds_many :tenants, Tenant, on_replace: :delete

    has_many :tags, Tag, foreign_key: :resource_id

    has_many :sap_systems, SapSystemReadModel, foreign_key: :database_id

    has_many :database_instances, DatabaseInstanceReadModel,
      references: :id,
      foreign_key: :database_id,
      preload_order: [asc: :instance_number, asc: :host_id]

    field :deregistered_at, :utc_datetime_usec

    timestamps(type: :utc_datetime_usec)
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(database, attrs) do
    database
    |> cast(attrs, __MODULE__.__schema__(:fields) -- [:tenants])
    |> cast_embed(:tenants)
  end
end
