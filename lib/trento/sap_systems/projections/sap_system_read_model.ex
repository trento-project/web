defmodule Trento.SapSystems.Projections.SapSystemReadModel do
  @moduledoc """
  SAP System read model
  """

  use Ecto.Schema

  import Ecto.Changeset

  require Trento.SapSystems.Enums.EnsaVersion, as: EnsaVersion
  require Trento.Enums.Health, as: Health

  alias Trento.Databases.Projections.{
    DatabaseInstanceReadModel,
    DatabaseReadModel
  }

  alias Trento.SapSystems.Projections.ApplicationInstanceReadModel

  alias Trento.Tags.Tag

  defdelegate authorize(action, user, params), to: Trento.SapSystems.Policy

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:id, :binary_id, autogenerate: false}
  schema "sap_systems" do
    field :sid, :string
    field :tenant, :string
    field :db_host, :string
    field :health, Ecto.Enum, values: Health.values()
    field :ensa_version, Ecto.Enum, values: EnsaVersion.values(), default: EnsaVersion.no_ensa()

    belongs_to :database, DatabaseReadModel, type: :binary_id

    has_many :database_instances, DatabaseInstanceReadModel,
      references: :database_id,
      foreign_key: :database_id,
      preload_order: [asc: :instance_number, asc: :host_id]

    has_many :application_instances, ApplicationInstanceReadModel,
      references: :id,
      foreign_key: :sap_system_id,
      preload_order: [asc: :instance_number, asc: :host_id]

    has_many :tags, Tag, foreign_key: :resource_id

    field :deregistered_at, :utc_datetime_usec

    timestamps(type: :utc_datetime_usec)
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(sap_system, attrs) do
    cast(sap_system, attrs, __MODULE__.__schema__(:fields))
  end
end
