defmodule Trento.Clusters.Policy do
  @moduledoc """
  Policy for the Clusters resource
  """
  @behaviour Bodyguard.Policy

  import Trento.Support.PolicyHelper
  alias Trento.Clusters.Projections.ClusterReadModel
  alias Trento.Users.User

  def authorize(:select_checks, %User{} = user, ClusterReadModel),
    do: has_select_checks_ability?(user)

  def authorize(:request_checks_execution, %User{} = user, ClusterReadModel),
    do: has_global_ability?(user) or has_checks_execution_ability?(user)

  def authorize(_, _, _), do: true

  defp has_select_checks_ability?(user),
    do:
      has_global_ability?(user) or
        user_has_ability?(user, %{name: "all", resource: "cluster_checks_selection"})

  defp has_checks_execution_ability?(user),
    do: user_has_ability?(user, %{name: "all", resource: "cluster_checks_execution"})
end
