defmodule Trento.SoftwareUpdates.PolicyTest do
  use ExUnit.Case

  alias Trento.Abilities.Ability
  alias Trento.SoftwareUpdates.Policy
  alias Trento.SoftwareUpdates.Settings

  alias Trento.Users.User

  test "should allow suma settings actions if the user has all:all ability" do
    user = %User{abilities: [%Ability{name: "all", resource: "all"}]}

    assert Policy.authorize(:show, user, Settings)
    assert Policy.authorize(:create, user, Settings)
    assert Policy.authorize(:update, user, Settings)
    assert Policy.authorize(:delete, user, Settings)
    assert Policy.authorize(:test, user, Settings)
  end

  test "should allow suma settings actions if the user has all:suma_settings ability" do
    user = %User{abilities: [%Ability{name: "all", resource: "suma_settings"}]}

    assert Policy.authorize(:show, user, Settings)
    assert Policy.authorize(:create, user, Settings)
    assert Policy.authorize(:update, user, Settings)
    assert Policy.authorize(:delete, user, Settings)
    assert Policy.authorize(:test, user, Settings)
  end

  test "should allow suma settings actions if the user has no abilities" do
    user = %User{abilities: []}

    assert Policy.authorize(:show, user, Settings)
    assert Policy.authorize(:test, user, Settings)
  end

  test "should disallow creating, updating or changing suma settings if the user has no abilities" do
    user = %User{abilities: []}

    refute Policy.authorize(:create, user, Settings)
    refute Policy.authorize(:update, user, Settings)
    refute Policy.authorize(:delete, user, Settings)
  end
end
