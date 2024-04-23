defmodule Trento.Abilities.Ability do
  use Ecto.Schema
  import Ecto.Changeset

  schema "abilities" do
    field :label, :string
    field :name, :string
    field :resource, :string

    timestamps()
  end

  @doc false
  def changeset(ability, attrs) do
    ability
    |> cast(attrs, [:name, :resource, :label])
    |> validate_required([:name, :resource, :label])
  end
end
