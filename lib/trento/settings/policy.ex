defmodule Trento.Settings.Policy do
  @moduledoc """
  Policy for the Settings resource

  User with the ability all:all can perform all actions
  User with the ability all:api_key_settings can generate a new api key.
  User with the ability all:activity_logs_settings can change activity logs settings.
  """
  @behaviour Bodyguard.Policy

  import Trento.Support.AbilitiesHelper
  alias Trento.ActivityLog.Settings, as: ActivityLogSettings
  alias Trento.Settings.ApiKeySettings
  alias Trento.Settings.SuseManagerSettings

  alias Trento.Users.User

  def authorize(:update_api_key_settings, %User{} = user, ApiKeySettings),
    do: has_global_ability?(user) or has_api_key_settings_change_ability?(user)

  def authorize(:update_activity_log_settings, %User{} = user, ActivityLogSettings),
    do: has_global_ability?(user) or has_activity_logs_settings_change_ability?(user)

  def authorize(action, %User{} = user, SuseManagerSettings)
      when action in [
             :save_suse_manager_settings,
             :update_suse_manager_settings,
             :delete_suse_manager_settings
           ] do
    has_global_ability?(user) or has_suma_settings_change_ability?(user)
  end

  def authorize(_, _, _), do: true

  defp has_api_key_settings_change_ability?(user),
    do: user_has_ability?(user, %{name: "all", resource: "api_key_settings"})

  defp has_activity_logs_settings_change_ability?(user),
    do: user_has_ability?(user, %{name: "all", resource: "activity_logs_settings"})

  defp has_suma_settings_change_ability?(user),
    do: user_has_ability?(user, %{name: "all", resource: "suma_settings"})
end
