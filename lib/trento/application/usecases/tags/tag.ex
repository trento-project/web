defmodule Trento.Tag do
  @moduledoc false

  use Ecto.Schema

  import Ecto.Changeset

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:id, :id, autogenerate: true}
  schema "tags" do
    field :value, :string
    field :resource_id, Ecto.UUID
    field :resource_type, Ecto.Enum, values: [:host, :cluster, :sap_system, :database]
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(tag, attrs) do
    tag
    |> cast(attrs, [:value, :resource_id, :resource_type])
    |> validate_required([:value, :resource_id, :resource_type])
    |> unique_constraint([:resource_id, :value])
  end
end
