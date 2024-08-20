defmodule Trento.Users.Policy do
  @moduledoc """
  Policy for the User resource

  User with the ability all:all or users:all can perform any operation on the users.
  """
  @behaviour Bodyguard.Policy

  import Trento.Support.AbilitiesHelper
  alias Trento.Users.User

  def authorize(action, %User{} = user, User) when action in [:index, :show],
    do: has_read_ability?(user)

  def authorize(action, %User{} = user, User) when action in [:update, :delete, :create],
    do: has_write_ability?(user)

  def authorize(_, _, _), do: false

  defp has_read_ability?(user), do: has_global_ability?(user) or has_users_all_ability?(user)
  defp has_write_ability?(user), do: has_global_ability?(user) or has_users_all_ability?(user)

  defp has_users_all_ability?(%User{} = user),
    do: user_has_ability?(user, %{name: "all", resource: "users"})
end
