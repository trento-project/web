defmodule Tronto.Monitoring.DatabaseReadModel do
  @moduledoc """
  Database read model
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias Tronto.Monitoring.DatabaseInstanceReadModel

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:id, :binary_id, autogenerate: false}
  schema "databases" do
    field :sid, :string

    has_many :database_instances, DatabaseInstanceReadModel,
      references: :id,
      foreign_key: :sap_system_id
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(database, attrs) do
    cast(database, attrs, __MODULE__.__schema__(:fields))
  end
end
