defmodule Trento.SoftwareUpdates.PolicyTest do
  use ExUnit.Case

  alias Trento.Abilities.Ability
  alias Trento.SoftwareUpdates.Policy
  alias Trento.SoftwareUpdates.Settings
  alias Trento.Users.User

  test "should allow to edit and clear suma settings if the user has all:suma_settings ability" do
    user = %User{abilities: [%Ability{name: "all", resource: "suma_settings"}]}
    assert Policy.authorize(:suma_settings, user, Settings)
  end

  test "should disallow to edit and clear  suma settings  if the user does not have all:suma_settings ability" do
    user = %User{abilities: []}
    refute Policy.authorize(:suma_settings, user, Settings)
  end

  test "should allow unguarded actions" do
    user = %User{abilities: []}

    Enum.each([:list], fn action ->
      assert Policy.authorize(action, user, Settings)
    end)
  end
end
