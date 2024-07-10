defmodule Trento.SoftwareUpdates.Policy do
  @moduledoc """
  Policy for the SoftwareUpdates resource

  User with the ability all:all can edit suma settings and clear suma settings.
  User with the ability all:suma_settings can edit suma settings and clear suma settings.
  """

  @behaviour Bodyguard.Policy

  import Trento.Support.PolicyHelper
  alias Trento.SoftwareUpdates.Settings

  alias Trento.Users.User

  def authorize(action, %User{} = user, Settings)
      when action in [:create, :update, :delete] do
    has_global_ability?(user) or has_suma_settings_change_ability?(user)
  end

  def authorize(_, _, _), do: true

  defp has_suma_settings_change_ability?(user),
    do: user_has_ability?(user, %{name: "all", resource: "suma_settings"})
end
