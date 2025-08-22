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

  describe "request_operation" do
    operations = [
      %{
        operation: "database_start",
        ability: "start"
      },
      %{
        operation: "database_stop",
        ability: "stop"
      }
    ]

    for %{operation: operation, ability: ability} <- operations do
      @operation operation
      @ability ability

      test "should allow #{operation} operation if the user has #{ability}:database ability" do
        user = %User{abilities: [%Ability{name: @ability, resource: "database"}]}

        assert Policy.authorize(:request_operation, user, %{
                 operation: @operation
               })
      end

      test "should allow #{operation} operation if the user has all:all ability" do
        user = %User{abilities: [%Ability{name: "all", resource: "all"}]}

        assert Policy.authorize(:request_operation, user, %{
                 operation: @operation
               })
      end

      test "should disallow #{operation} operation if the user does not have #{ability}:database ability" do
        user = %User{abilities: [%Ability{name: "all", resource: "other_resource"}]}

        refute Policy.authorize(:request_operation, user, %{
                 operation: @operation
               })
      end
    end
  end
end
