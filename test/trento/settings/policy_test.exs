defmodule Trento.Settings.PolicyTest do
  use ExUnit.Case

  alias Trento.Abilities.Ability
  alias Trento.Settings.ApiKeySettings
  alias Trento.Settings.Policy
  alias Trento.Users.User

  test "should allow to generate new api key if the user has all:api_key_settings ability" do
    user = %User{abilities: [%Ability{name: "all", resource: "api_key_settings"}]}
    assert Policy.authorize(:api_key_settings, user, ApiKeySettings)
  end

  test "should disallow to generate new api key if the user does not have all:api_key_settings ability" do
    user = %User{abilities: []}
    refute Policy.authorize(:api_key_settings, user, ApiKeySettings)
  end

  test "should allow unguarded actions" do
    user = %User{abilities: []}

    Enum.each([:list], fn action ->
      assert Policy.authorize(action, user, ApiKeySettings)
    end)
  end
end
