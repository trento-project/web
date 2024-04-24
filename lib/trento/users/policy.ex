defmodule Trento.Users.Policy do
  @moduledoc """
  Policy for the User resource

  User with the ability all:all can perform every operation on the users.
  A user can update and show himself.
  """
  @behaviour Bodyguard.Policy

  alias Trento.Users.User

  def authorize(:show, %User{id: id}, %User{id: id}), do: true

  def authorize(action, %User{} = user, %User{}) when action in [:index, :show],
    do: has_read_ability?(user)

  def authorize(:update, %User{id: id}, %User{id: id}), do: true

  def authorize(action, %User{} = user, %User{}) when action in [:update, :delete, :create],
    do: has_write_ability?(user)

  def authorize(_, _, _), do: false

  defp has_write_ability?(user), do: has_global_ability?(user)
  defp has_read_ability?(user), do: has_global_ability?(user)

  defp has_global_ability?(%User{abilities: abilities}),
    do: Enum.any?(abilities, &(&1.name == "all" and &1.resource == "all"))
end
