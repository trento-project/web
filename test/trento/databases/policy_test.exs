defmodule Trento.Databases.PolicyTest do
  use ExUnit.Case

  alias Trento.Abilities.Ability
  alias Trento.Databases.Policy
  alias Trento.Databases.Projections.DatabaseReadModel
  alias Trento.Users.User

  test "should allow delete_database_instance action if the user has cleanup:database_instance ability" do
    user = %User{abilities: [%Ability{name: "cleanup", resource: "database_instance"}]}

    assert Policy.authorize(:delete_database_instance, user, DatabaseReadModel)
  end

  test "should allow delete_database_instance action if the user has all:all ability" do
    user = %User{abilities: [%Ability{name: "all", resource: "all"}]}

    assert Policy.authorize(:delete_database_instance, user, DatabaseReadModel)
  end

  test "should disallow delete_database_instance action if the user does not have cleanup:database_instance ability" do
    user = %User{abilities: []}

    refute Policy.authorize(:delete_database_instance, user, DatabaseReadModel)
  end

  test "should allow unguarded actions" do
    user = %User{abilities: []}

    Enum.each([:list], fn action ->
      assert Policy.authorize(action, user, DatabaseReadModel)
    end)
  end
end
