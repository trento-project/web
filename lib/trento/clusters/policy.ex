defmodule Trento.Clusters.Policy do
  @moduledoc """
  Policy for the Clusters resource
  """
  @behaviour Bodyguard.Policy

  import Trento.Support.AbilitiesHelper
  alias Trento.Clusters.Projections.ClusterReadModel
  alias Trento.Users.User

  def authorize(:select_checks, %User{} = user, ClusterReadModel),
    do: has_select_checks_ability?(user)

  def authorize(:request_checks_execution, %User{} = user, ClusterReadModel),
    do: has_global_ability?(user) or has_checks_execution_ability?(user)

  def authorize(operation_kind, %User{} = user, %{
        operation: operation
      })
      when operation_kind in [:request_operation, :request_host_operation],
      do:
        has_global_ability?(user) or
          user_has_ability?(user, %{name: to_ability_name(operation), resource: "cluster"})

  def authorize(_, _, _), do: true

  defp has_select_checks_ability?(user),
    do:
      has_global_ability?(user) or
        user_has_ability?(user, %{name: "all", resource: "cluster_checks_selection"})

  defp has_checks_execution_ability?(user),
    do: user_has_ability?(user, %{name: "all", resource: "cluster_checks_execution"})

  # usually the operation name is the same as the ability name
  # for those operations that are not, we need to map them
  defp to_ability_name("cluster_maintenance_change"), do: "maintenance_change"
  defp to_ability_name(operation), do: operation
end
