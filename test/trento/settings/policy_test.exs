defmodule Trento.Settings.PolicyTest do
  use ExUnit.Case

  alias Trento.Abilities.Ability
  alias Trento.Settings.ActivityLogSettings
  alias Trento.Settings.AlertingSettings
  alias Trento.Settings.ApiKeySettings
  alias Trento.Settings.SuseManagerSettings

  alias Trento.Settings.Policy
  alias Trento.Users.User

  describe "api key settings suthorization" do
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

  describe "activity log settings authorization" do
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

  describe "suse manager settings authorization" do
    test "should allow suma settings actions if the user has all:all ability" do
      user = %User{abilities: [%Ability{name: "all", resource: "all"}]}

      assert Policy.authorize(:get_suse_manager_settings, user, SuseManagerSettings)
      assert Policy.authorize(:save_suse_manager_settings, user, SuseManagerSettings)
      assert Policy.authorize(:update_suse_manager_settings, user, SuseManagerSettings)
      assert Policy.authorize(:delete_suse_manager_settings, user, SuseManagerSettings)
      assert Policy.authorize(:test_suse_manager_settings, user, SuseManagerSettings)
    end

    test "should allow suma settings actions if the user has all:suma_settings ability" do
      user = %User{abilities: [%Ability{name: "all", resource: "suma_settings"}]}

      assert Policy.authorize(:get_suse_manager_settings, user, SuseManagerSettings)
      assert Policy.authorize(:save_suse_manager_settings, user, SuseManagerSettings)
      assert Policy.authorize(:update_suse_manager_settings, user, SuseManagerSettings)
      assert Policy.authorize(:delete_suse_manager_settings, user, SuseManagerSettings)
      assert Policy.authorize(:test_suse_manager_settings, user, SuseManagerSettings)
    end

    test "should allow suma settings actions if the user has no abilities" do
      user = %User{abilities: []}

      assert Policy.authorize(:get_suse_manager_settings, user, SuseManagerSettings)
      assert Policy.authorize(:test_suse_manager_settings, user, SuseManagerSettings)
    end

    test "should disallow creating, updating or changing suma settings if the user has no abilities" do
      user = %User{abilities: []}

      refute Policy.authorize(:save_suse_manager_settings, user, SuseManagerSettings)
      refute Policy.authorize(:update_suse_manager_settings, user, SuseManagerSettings)
      refute Policy.authorize(:delete_suse_manager_settings, user, SuseManagerSettings)
    end
  end

  describe "AlertingSettings authorization" do
    test "allows alerting settings actions if user has all:all abilities" do
      user = %User{abilities: [%Ability{name: "all", resource: "all"}]}

      assert Policy.authorize(:get_alerting_settings, user, AlertingSettings)
      assert Policy.authorize(:set_alerting_settings, user, AlertingSettings)
    end

    test "allows alerting settings actions if user has all:alerting_settings abilities" do
      user = %User{abilities: [%Ability{name: "all", resource: "alerting_settings"}]}

      assert Policy.authorize(:get_alerting_settings, user, AlertingSettings)
      assert Policy.authorize(:set_alerting_settings, user, AlertingSettings)
    end

    test "allows safe alerting settings actions if user has no abilities" do
      user = %User{abilities: []}
      assert Policy.authorize(:get_alerting_settings, user, AlertingSettings)
    end

    test "should disallow setting alerting settings if the user has no abilities" do
      user = %User{abilities: []}
      refute Policy.authorize(:set_alerting_settings, user, AlertingSettings)
    end
  end
end
