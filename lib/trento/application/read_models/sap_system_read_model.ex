defmodule Trento.SapSystemReadModel do
  @moduledoc """
  SAP System read model
  """

  use Ecto.Schema

  import Ecto.Changeset

  require Trento.Domain.Enums.EnsaVersion, as: EnsaVersion
  require Trento.Domain.Enums.Health, as: Health

  alias Trento.{
    ApplicationInstanceReadModel,
    DatabaseInstanceReadModel
  }

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:id, :binary_id, autogenerate: false}
  schema "sap_systems" do
    field :sid, :string
    field :tenant, :string
    field :db_host, :string
    field :health, Ecto.Enum, values: Health.values()
    field :ensa_version, Ecto.Enum, values: EnsaVersion.values(), default: EnsaVersion.no_ensa()

    has_many :database_instances, DatabaseInstanceReadModel,
      references: :id,
      foreign_key: :sap_system_id,
      preload_order: [asc: :instance_number, asc: :host_id]

    has_many :application_instances, ApplicationInstanceReadModel,
      references: :id,
      foreign_key: :sap_system_id,
      preload_order: [asc: :instance_number, asc: :host_id]

    has_many :tags, Trento.Tag, foreign_key: :resource_id

    field :deregistered_at, :utc_datetime_usec
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(sap_system, attrs) do
    cast(sap_system, attrs, __MODULE__.__schema__(:fields))
  end
end
