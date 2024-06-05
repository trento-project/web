defmodule Trento.Support.PolicyHelperTest do
  use ExUnit.Case

  import Trento.Factory

  alias Trento.Support.PolicyHelper

  test "user_has_ability/2 returns true if user has the ability on the resource" do
    first_ability = build(:ability, name: "manage", resource: "things")
    second_ability = build(:ability, name: "read", resource: "things")

    user = build(:user, abilities: [first_ability, second_ability])

    assert true == PolicyHelper.user_has_ability?(user, %{name: "manage", resource: "things"})
  end

  test "user_has_ability/2 returns false if user does not have the ability on the resource" do
    first_ability = build(:ability, name: "manage", resource: "things")
    second_ability = build(:ability, name: "read", resource: "things")

    user = build(:user, abilities: [first_ability, second_ability])

    assert false == PolicyHelper.user_has_ability?(user, %{name: "write", resource: "things"})
  end

  test "has_global_ability/2 returns true if user does have the global ability" do
    first_ability = build(:ability, name: "manage", resource: "things")
    second_ability = build(:ability, name: "all", resource: "all")

    user = build(:user, abilities: [first_ability, second_ability])

    assert true == PolicyHelper.has_global_ability?(user)
  end
end
