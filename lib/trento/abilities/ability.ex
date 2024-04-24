defmodule Trento.Abilities.Ability do
  @moduledoc false

  use Ecto.Schema
  import Ecto.Changeset

  alias Trento.Abilities.UsersAbilities
  alias Trento.Users.User

  schema "abilities" do
    field :label, :string
    field :name, :string
    field :resource, :string

    many_to_many :users, User, join_through: UsersAbilities, unique: true

    timestamps()
  end

  @doc false
  def changeset(ability, attrs) do
    ability
    |> cast(attrs, [:name, :resource, :label])
    |> validate_required([:name, :resource, :label])
  end
end
