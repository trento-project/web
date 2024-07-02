defmodule Trento.Settings.Policy do
  @moduledoc """
  Policy for the Settings resource

  User with the ability all:all can generate api key, edit suma settings and clear suma settings.
  User with the ability all:api_key_settings can generate api key.
  User with the ability all:suma_settings can edit suma settings and clear suma settings.
  """

  @behaviour Bodyguard.Policy

  import Trento.Support.PolicyHelper
  alias Trento.Settings.ApiKeySettings
  alias Trento.SoftwareUpdates.Settings, as: SumaSettings
  alias Trento.Users.User

  def authorize(:api_key_settings, %User{} = user, ApiKeySettings),
    do: has_global_ability?(user) or has_api_key_settings_change_ability?(user)

  def authorize(:suma_settings, %User{} = user, SumaSettings),
    do: has_global_ability?(user) or has_suma_settings_change_ability?(user)

  def authorize(_, _, _), do: true

  defp has_api_key_settings_change_ability?(user),
    do: user_has_ability?(user, %{name: "all", resource: "settings"})

  defp has_suma_settings_change_ability?(user),
    do: user_has_ability?(user, %{name: "all", resource: "settings"})
end
