defmodule Trento.DatabaseReadModel do
  @moduledoc """
  Database read model
  """

  use Ecto.Schema

  import Ecto.Changeset

  require Trento.Domain.Enums.Health, as: Health

  alias Trento.DatabaseInstanceReadModel

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:id, :binary_id, autogenerate: false}
  schema "databases" do
    field :sid, :string
    field :health, Ecto.Enum, values: Health.values()

    has_many :tags, Trento.Tag, foreign_key: :resource_id

    has_many :database_instances, DatabaseInstanceReadModel,
      references: :id,
      foreign_key: :sap_system_id,
      preload_order: [asc: :instance_number, asc: :host_id]
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(database, attrs) do
    cast(database, attrs, __MODULE__.__schema__(:fields))
  end
end
