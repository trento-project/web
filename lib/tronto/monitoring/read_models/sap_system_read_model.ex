defmodule Tronto.Monitoring.SapSystemReadModel do
  @moduledoc """
  SAP System read model
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias Tronto.Monitoring.{
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
    field :health, Ecto.Enum, values: [:passing, :warning, :critical, :unknown]

    has_many :database_instances, DatabaseInstanceReadModel,
      references: :id,
      foreign_key: :sap_system_id,
      preload_order: [asc: :instance_number, asc: :host_id]

    has_many :application_instances, ApplicationInstanceReadModel,
      references: :id,
      foreign_key: :sap_system_id,
      preload_order: [asc: :instance_number, asc: :host_id]
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(sap_system, attrs) do
    cast(sap_system, attrs, __MODULE__.__schema__(:fields))
  end
end
