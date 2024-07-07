defmodule Trento.Settings.PolicyTest do
  use ExUnit.Case

  alias Trento.Abilities.Ability
  alias Trento.Settings.ApiKeySettings
  alias Trento.Settings.Policy
  alias Trento.Users.User

  test "should allow generating a new api key if the user has all:all ability" do
    user = %User{abilities: [%Ability{name: "all", resource: "all"}]}
    assert Policy.authorize(:update_api_key_settings, user, ApiKeySettings)
    assert Policy.authorize(:get_api_key_settings, user, ApiKeySettings)
    assert Policy.authorize(:settings, user, ApiKeySettings)
  end

  test "should allow generating a new api key if the user has all:api_key_settings ability" do
    user = %User{abilities: [%Ability{name: "all", resource: "api_key_settings"}]}
    assert Policy.authorize(:update_api_key_settings, user, ApiKeySettings)
    assert Policy.authorize(:get_api_key_settings, user, ApiKeySettings)
    assert Policy.authorize(:settings, user, ApiKeySettings)
  end

  test "should disallow new api key generation for other abilities" do
    user = %User{abilities: [%Ability{name: "other", resource: "other"}]}
    refute Policy.authorize(:update_api_key_settings, user, ApiKeySettings)
    refute Policy.authorize(:get_api_key_settings, user, ApiKeySettings)
    refute Policy.authorize(:settings, user, ApiKeySettings)
  end

  test "should disallow new api key generation when user has no abilities" do
    user = %User{abilities: []}
    refute Policy.authorize(:update_api_key_settings, user, ApiKeySettings)
    refute Policy.authorize(:get_api_key_settings, user, ApiKeySettings)
    refute Policy.authorize(:settings, user, ApiKeySettings)
  end
end
