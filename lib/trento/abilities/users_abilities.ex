defmodule Trento.Abilities.UsersAbilities do
  @moduledoc """
  Many to main table schema used to connect users and abilities.

  We have a dedicated schema to write associations with users and abilities,
  in the User and Ability schema, associations are read only.
  """
   use Ecto.Schema
   import Ecto.Changeset

   alias Trento.Abilities.Ability
   alias Trento.Users.User

  schema "users_abilities" do
    belongs_to :user, User
    belongs_to :ability, Ability
  end

  def changeset(association, attrs) do
    association
    |> cast(attrs, [:user_id, :ability_id])
    |> validate_required([:user_id, :ability_id])
  end
end
