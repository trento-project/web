defmodule Trento.SoftwareUpdates.PolicyTest do
  use ExUnit.Case

  alias Trento.Abilities.Ability
  alias Trento.SoftwareUpdates
  alias Trento.SoftwareUpdates.Policy

  alias Trento.Users.User

  test "should allow suma settings actions if the user has all:all ability" do
    user = %User{abilities: [%Ability{name: "all", resource: "all"}]}

    assert Policy.authorize(:show, user, SoftwareUpdates)
    assert Policy.authorize(:create, user, SoftwareUpdates)
    assert Policy.authorize(:update, user, SoftwareUpdates)
    assert Policy.authorize(:delete, user, SoftwareUpdates)
    assert Policy.authorize(:test, user, SoftwareUpdates)
  end

  test "should allow suma settings actions if the user has all:suma_settings ability" do
    user = %User{abilities: [%Ability{name: "all", resource: "suma_settings"}]}

    assert Policy.authorize(:show, user, SoftwareUpdates)
    assert Policy.authorize(:create, user, SoftwareUpdates)
    assert Policy.authorize(:update, user, SoftwareUpdates)
    assert Policy.authorize(:delete, user, SoftwareUpdates)
    assert Policy.authorize(:test, user, SoftwareUpdates)
  end

  test "should disallow suma settings actions if the user has other abilities" do
    user = %User{abilities: [%Ability{name: "other", resource: "other"}]}

    refute Policy.authorize(:show, user, SoftwareUpdates)
    refute Policy.authorize(:create, user, SoftwareUpdates)
    refute Policy.authorize(:update, user, SoftwareUpdates)
    refute Policy.authorize(:delete, user, SoftwareUpdates)
    refute Policy.authorize(:test, user, SoftwareUpdates)
  end

  test "should disallow suma settings actions if the user has no abilities" do
    user = %User{abilities: []}

    refute Policy.authorize(:show, user, SoftwareUpdates)
    refute Policy.authorize(:create, user, SoftwareUpdates)
    refute Policy.authorize(:update, user, SoftwareUpdates)
    refute Policy.authorize(:delete, user, SoftwareUpdates)
    refute Policy.authorize(:test, user, SoftwareUpdates)
  end
end
