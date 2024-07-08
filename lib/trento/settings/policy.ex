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

  def authorize(action, %User{} = user, ApiKeySettings)
      when action in [:update_api_key_settings, :get_api_key_settings, :settings] do
    has_global_ability?(user) or has_api_key_settings_change_ability?(user)
  end

  def authorize(action, %User{} = user, ApiKeySettings)
      when action in [:update_activity_log_settings] do
    has_global_ability?(user) or has_activity_logs_settings_change_ability?(user)
  end

  def authorize(:get_activity_log_settings, %User{}, ApiKeySettings), do: true

  def authorize(_, %User{} = user, _), do: has_global_ability?(user)

  defp has_api_key_settings_change_ability?(user),
    do: user_has_ability?(user, %{name: "all", resource: "api_key_settings"})

  defp has_activity_logs_settings_change_ability?(user),
    do: user_has_ability?(user, %{name: "all", resource: "activity_logs_settings"})
end
