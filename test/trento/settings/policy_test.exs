defmodule Trento.Settings.PolicyTest do
  use ExUnit.Case

  alias Trento.Abilities.Ability
  alias Trento.ActivityLog.Settings, as: ActivityLogSettings
  alias Trento.Settings.ApiKeySettings
  alias Trento.Settings.Policy
  alias Trento.Users.User

  describe "API Key Settings Authorization" do
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

    test "should allow getting api key settings with default abilities" do
      user = %User{}
      assert Policy.authorize(:get_api_key_settings, user, ApiKeySettings)
      assert Policy.authorize(:settings, user, ApiKeySettings)
    end

    test "should not allow new api key generation for other abilities" do
      user = %User{abilities: [%Ability{name: "other", resource: "other"}]}
      refute Policy.authorize(:update_api_key_settings, user, ApiKeySettings)
    end

    test "should not allow new api key generation when user has no abilities" do
      user = %User{abilities: []}
      refute Policy.authorize(:update_api_key_settings, user, ApiKeySettings)
    end
  end

  describe "Activity Log Settings Authorization" do
    test "should allow updating activity logs settings if the user has all:all ability" do
      user = %User{abilities: [%Ability{name: "all", resource: "all"}]}
      assert Policy.authorize(:update_activity_log_settings, user, ActivityLogSettings)
    end

    test "should allow updating activity logs settings if the user has all:activity_logs_settings ability" do
      user = %User{abilities: [%Ability{name: "all", resource: "activity_logs_settings"}]}
      assert Policy.authorize(:update_activity_log_settings, user, ActivityLogSettings)
    end

    test "should allow getting current activity logs settings if the user has default abilities" do
      user = %User{}
      assert Policy.authorize(:get_activity_log_settings, user, ActivityLogSettings)
    end

    test "should not allow updating activity logs  for other abilities" do
      user = %User{abilities: [%Ability{name: "other", resource: "other"}]}
      refute Policy.authorize(:update_activity_log_settings, user, ActivityLogSettings)
    end

    test "should not allow updating activity logs settings if the user has no abilities" do
      user = %User{abilities: []}
      refute Policy.authorize(:update_activity_log_settings, user, ActivityLogSettings)
    end
  end
end
