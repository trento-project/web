defmodule Trento.SoftwareUpdates.PolicyTest do
  use ExUnit.Case

  alias Trento.Abilities.Ability
  alias Trento.SoftwareUpdates.Policy
  alias Trento.SoftwareUpdates.Settings
  alias Trento.Users.User

  test "should allow editing and clearing suma settings if the user has all:all ability" do
    user = %User{abilities: [%Ability{name: "all", resource: "all"}]}
    assert Policy.authorize(:suma_settings, user, Settings)
  end

  test "should allow editing and clearing suma settings if the user has all:suma_settings ability" do
    user = %User{abilities: [%Ability{name: "all", resource: "suma_settings"}]}
    assert Policy.authorize(:suma_settings, user, Settings)
  end

  test "should disallow editing and clearing suma settings if the user has other abilities" do
    user = %User{abilities: [%Ability{name: "other", resource: "other"}]}
    refute Policy.authorize(:other_ability, user, Settings)
  end

  test "should disallow editing and clearing suma settings if the user has no abilities" do
    user = %User{abilities: []}
    refute Policy.authorize(:suma_settings, user, Settings)
  end
end
