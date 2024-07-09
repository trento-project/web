defmodule Trento.Settings.Policy do
  @moduledoc """
  Policy for the Settings resource

  User with the ability all:all can generate a new api key.
  User with the ability all:api_key_settings can generate a new api key.
  User with the ability all:all can change activity logs settings.
  User with the ability all:activity_logs_settings can change activity logs settings.
  """
  require Logger
  @behaviour Bodyguard.Policy

  import Trento.Support.PolicyHelper
  alias Trento.Settings.ApiKeySettings
  alias Trento.Users.User

  def authorize(:update_api_key_settings, %User{} = user, ApiKeySettings),
    do: has_global_ability?(user) or has_api_key_settings_change_ability?(user)

  def authorize(action, %User{}, ApiKeySettings)
      when action in [:settings, :get_api_key_settings],
      do: true

  def authorize(:update_activity_log_settings, %User{} = user, ApiKeySettings),
    do: has_global_ability?(user) or has_activity_logs_settings_change_ability?(user)

  def authorize(:get_activity_log_settings, %User{}, ApiKeySettings), do: true

  def authorize(_, %User{} = user, _), do: has_global_ability?(user)

  defp has_api_key_settings_change_ability?(user),
    do: user_has_ability?(user, %{name: "all", resource: "api_key_settings"})

  defp has_activity_logs_settings_change_ability?(user),
    do: user_has_ability?(user, %{name: "all", resource: "activity_logs_settings"})
end
