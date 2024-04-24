defmodule Trento.Abilities.UsersAbilities do
  @moduledoc """
  Many to many table schema used to connect users and abilities.

  We have a dedicated schema to implement the association between users and abilities,
  to just enable read only operation.
  Using the default ecto schema, declaring a user with a not existing ability would trigger the creation of this second,
  and we don't want to allow that. Abilities are just read only.
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
