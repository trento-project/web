defmodule Trento.Databases.Policy do
  @moduledoc """
  Policy for the Database resource

  User with the ability cleanup:database_instance can cleanup a database instance.
  """
  @behaviour Bodyguard.Policy

  import Trento.Support.AbilitiesHelper
  alias Trento.Databases.Projections.DatabaseReadModel
  alias Trento.Users.User

  def authorize(:delete_database_instance, %User{} = user, DatabaseReadModel),
    do: has_global_ability?(user) or has_cleanup_ability?(user)

  def authorize(:request_operation, %User{} = user, %{operation: "database_start"}),
    do: has_global_ability?(user) or has_database_start_ability?(user)

  def authorize(:request_operation, %User{} = user, %{operation: "database_stop"}),
    do: has_global_ability?(user) or has_database_stop_ability?(user)

  def authorize(_, _, _), do: true

  defp has_cleanup_ability?(user),
    do: user_has_ability?(user, %{name: "cleanup", resource: "database_instance"})

  defp has_database_start_ability?(user),
    do: user_has_ability?(user, %{name: "start", resource: "database"})

  defp has_database_stop_ability?(user),
    do: user_has_ability?(user, %{name: "stop", resource: "database"})
end
