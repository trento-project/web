defmodule Trento.Support.PolicyHelper do
  @moduledoc """
  Helper functions for bodyguard policies
  """
  alias Trento.Users.User

  def user_has_ability?(%User{abilities: abilities}, %{name: name, resource: resource}),
    do: Enum.any?(abilities, &(&1.name == name and &1.resource == resource))

  def has_global_ability?(%User{} = user),
    do: user_has_ability?(user, %{name: "all", resource: "all"})
end
