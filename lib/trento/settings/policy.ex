defmodule Trento.Settings.Policy do
  @moduledoc """
  Policy for the Settings resource

  User with the ability all:all can generate a new api key.
  User with the ability all:api_key_settings can generate a new api key.
  """

  @behaviour Bodyguard.Policy

  import Trento.Support.PolicyHelper
  alias Trento.Settings.ApiKeySettings
  alias Trento.Users.User

  def authorize(:api_key_settings, %User{} = user, ApiKeySettings),
    do: has_global_ability?(user) or has_api_key_settings_change_ability?(user)

  def authorize(_, _, _), do: true

  defp has_api_key_settings_change_ability?(user),
    do: user_has_ability?(user, %{name: "all", resource: "api_key_settings"})
end
