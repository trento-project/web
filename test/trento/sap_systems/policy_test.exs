defmodule Trento.SapSystems.PolicyTest do
  use ExUnit.Case

  alias Trento.Abilities.Ability
  alias Trento.SapSystems.Policy
  alias Trento.SapSystems.Projections.SapSystemReadModel
  alias Trento.Users.User

  test "should allow delete_application_instance action if the user has cleanup:application_instance ability" do
    user = %User{abilities: [%Ability{name: "cleanup", resource: "application_instance"}]}

    assert Policy.authorize(:delete_application_instance, user, SapSystemReadModel)
  end

  test "should allow delete_application_instance action if the user has all:all ability" do
    user = %User{abilities: [%Ability{name: "all", resource: "all"}]}

    assert Policy.authorize(:delete_application_instance, user, SapSystemReadModel)
  end

  test "should disallow delete_application_instance action if the user does not have cleanup:application_instance ability" do
    user = %User{abilities: []}

    refute Policy.authorize(:delete_application_instance, user, SapSystemReadModel)
  end

  test "should allow unguarded actions" do
    user = %User{abilities: []}

    Enum.each([:list], fn action ->
      assert Policy.authorize(action, user, SapSystemReadModel)
    end)
  end
end
