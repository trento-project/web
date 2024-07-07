defmodule Trento.SoftwareUpdates.Policy do
  @moduledoc """
  Policy for the SoftwareUpdates resource

  User with the ability all:all can edit suma settings and clear suma settings.
  User with the ability all:suma_settings can edit suma settings and clear suma settings.
  """

  @behaviour Bodyguard.Policy

  import Trento.Support.PolicyHelper
  alias Trento.SoftwareUpdates.Settings, as: SumaSettings
  alias Trento.Users.User

  def authorize(:suma_settings, %User{} = user, SumaSettings),
    do: has_global_ability?(user) or has_suma_settings_change_ability?(user)

  def authorize(_, user, _), do: has_global_ability?(user)

  defp has_suma_settings_change_ability?(user),
    do: user_has_ability?(user, %{name: "all", resource: "suma_settings"})
end
