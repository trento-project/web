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

  def authorize(:request_operation, %User{} = user, %{operation: "cluster_maintenance_change"}),
    do: has_global_ability?(user) or has_cluster_maintenance_change_ability?(user)

  def authorize(:request_host_operation, %User{} = user, %{
        operation: "pacemaker_enable"
      }),
      do: has_global_ability?(user) or has_enable_pacemaker_ability?(user)

  def authorize(:request_host_operation, %User{} = user, %{
        operation: "pacemaker_disable"
      }),
      do: has_global_ability?(user) or has_disable_pacemaker_ability?(user)

  def authorize(_, _, _), do: true

  defp has_select_checks_ability?(user),
    do:
      has_global_ability?(user) or
        user_has_ability?(user, %{name: "all", resource: "cluster_checks_selection"})

  defp has_checks_execution_ability?(user),
    do: user_has_ability?(user, %{name: "all", resource: "cluster_checks_execution"})

  defp has_cluster_maintenance_change_ability?(user),
    do: user_has_ability?(user, %{name: "maintenance_change", resource: "cluster"})

  defp has_enable_pacemaker_ability?(user),
    do: user_has_ability?(user, %{name: "pacemaker_enable", resource: "cluster"})

  defp has_disable_pacemaker_ability?(user),
    do: user_has_ability?(user, %{name: "pacemaker_disable", resource: "cluster"})
end
