defmodule Trento.SoftwareUpdates.PolicyTest do
  use ExUnit.Case

  alias Trento.Abilities.Ability
  alias Trento.SoftwareUpdates.Policy
  alias Trento.Settings.SuseManagerSettings

  alias Trento.Users.User

  test "should allow suma settings actions if the user has all:all ability" do
    user = %User{abilities: [%Ability{name: "all", resource: "all"}]}

    assert Policy.authorize(:show, user, SuseManagerSettings)
    assert Policy.authorize(:create, user, SuseManagerSettings)
    assert Policy.authorize(:update, user, SuseManagerSettings)
    assert Policy.authorize(:delete, user, SuseManagerSettings)
    assert Policy.authorize(:test, user, SuseManagerSettings)
  end

  test "should allow suma settings actions if the user has all:suma_settings ability" do
    user = %User{abilities: [%Ability{name: "all", resource: "suma_settings"}]}

    assert Policy.authorize(:show, user, SuseManagerSettings)
    assert Policy.authorize(:create, user, SuseManagerSettings)
    assert Policy.authorize(:update, user, SuseManagerSettings)
    assert Policy.authorize(:delete, user, SuseManagerSettings)
    assert Policy.authorize(:test, user, SuseManagerSettings)
  end

  test "should allow suma settings actions if the user has no abilities" do
    user = %User{abilities: []}

    assert Policy.authorize(:show, user, SuseManagerSettings)
    assert Policy.authorize(:test, user, SuseManagerSettings)
  end

  test "should disallow creating, updating or changing suma settings if the user has no abilities" do
    user = %User{abilities: []}

    refute Policy.authorize(:create, user, SuseManagerSettings)
    refute Policy.authorize(:update, user, SuseManagerSettings)
    refute Policy.authorize(:delete, user, SuseManagerSettings)
  end
end
