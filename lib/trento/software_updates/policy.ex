defmodule Trento.SoftwareUpdates.Policy do
  @moduledoc """
  Policy for the SoftwareUpdates resource

  User with the ability all:all can edit suma settings and clear suma settings.
  User with the ability all:suma_settings can edit suma settings and clear suma settings.
  """

  @behaviour Bodyguard.Policy

  import Trento.Support.PolicyHelper
  alias Trento.SoftwareUpdates
  alias Trento.Users.User

  def authorize(action, %User{} = user, SoftwareUpdates)
      when action in [:create, :update, :delete] do
    has_global_ability?(user) or has_suma_settings_change_ability?(user)
  end

  def authorize(action, %User{}, SoftwareUpdates)
      when action in [:show, :test],
      do: true

  def authorize(_, %User{} = user, _), do: has_global_ability?(user)

  defp has_suma_settings_change_ability?(user),
    do: user_has_ability?(user, %{name: "all", resource: "suma_settings"})
end
