defmodule Trento.Databases.Policy do
  @moduledoc """
  Policy for the Database resource

  User with the ability cleanup:database_instance can cleanup a database instance.
  """
  @behaviour Bodyguard.Policy

  import Trento.Support.PolicyHelper
  alias Trento.Databases.Projections.DatabaseReadModel
  alias Trento.Users.User

  def authorize(:delete_database_instance, %User{} = user, DatabaseReadModel),
    do: has_global_ability?(user) or has_cleanup_ability?(user)

  def authorize(_, _, _), do: true

  defp has_cleanup_ability?(user),
    do: user_has_ability?(user, %{name: "cleanup", resource: "database_instance"})
end
