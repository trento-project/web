defmodule Trento.Support.AbilitiesHelperTest do
  use ExUnit.Case

  import Trento.Factory

  alias Trento.Support.AbilitiesHelper

  test "user_has_ability/2 returns true if user has the ability on the resource" do
    first_ability = build(:ability, name: "manage", resource: "things")
    second_ability = build(:ability, name: "read", resource: "things")

    user = build(:user, abilities: [first_ability, second_ability])

    assert true == AbilitiesHelper.user_has_ability?(user, %{name: "manage", resource: "things"})
  end

  test "user_has_ability/2 returns false if user does not have the ability on the resource" do
    first_ability = build(:ability, name: "manage", resource: "things")
    second_ability = build(:ability, name: "read", resource: "things")

    user = build(:user, abilities: [first_ability, second_ability])

    assert false == AbilitiesHelper.user_has_ability?(user, %{name: "write", resource: "things"})
  end

  test "has_global_ability/2 returns true if user does have the global ability" do
    first_ability = build(:ability, name: "manage", resource: "things")
    second_ability = build(:ability, name: "all", resource: "all")

    user = build(:user, abilities: [first_ability, second_ability])

    assert true == AbilitiesHelper.has_global_ability?(user)
  end

  test "has_global_ability/2 returns false if user does not have the global ability" do
    first_ability = build(:ability, name: "manage", resource: "things")
    second_ability = build(:ability, name: "read", resource: "things")

    user = build(:user, abilities: [first_ability, second_ability])

    refute AbilitiesHelper.has_global_ability?(user)
  end

  test "user_has_any_ability/2 returns true if user does have any of the required abilities" do
    first_ability = build(:ability, name: "manage", resource: "things")
    second_ability = build(:ability, name: "read", resource: "things")
    third_ability = build(:ability, name: "delete", resource: "things")

    user = build(:user, abilities: [first_ability, second_ability, third_ability])

    assert true ==
             AbilitiesHelper.user_has_any_ability?(user, [
               %{name: "manage", resource: "things"},
               %{name: "foo", resource: "bar"}
             ])
  end

  test "user_has_any_ability/2 returns false if user does not have any of the required abilities" do
    first_ability = build(:ability, name: "manage", resource: "things")
    second_ability = build(:ability, name: "read", resource: "things")

    user = build(:user, abilities: [first_ability, second_ability])

    refute AbilitiesHelper.user_has_any_ability?(user, [
             %{name: "foo", resource: "bar"},
             %{name: "baz", resource: "qux"}
           ])
  end
end
