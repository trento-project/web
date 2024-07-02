defmodule Trento.Hosts.Policy do
  @moduledoc """
  Policy for the Host resource

  User with the ability all:all can perform any operation on the hosts.
  User with the ability all:host_checks_execution can perform a check executions on Hosts.
  User with the ability all:host_checks_selection can perform a check selection on Hosts.
  """
  @behaviour Bodyguard.Policy

  import Trento.Support.PolicyHelper
  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.Users.User

  def authorize(:select_checks, %User{} = user, HostReadModel),
    do: has_select_checks_ability?(user)

  def authorize(:request_checks_execution, %User{} = user, HostReadModel),
    do: has_global_ability?(user) or has_checks_execution_ability?(user)

  def authorize(_, _, _), do: true

  defp has_select_checks_ability?(user),
    do:
      has_global_ability?(user) or
        user_has_ability?(user, %{name: "all", resource: "host_checks_selection"})

  defp has_checks_execution_ability?(user),
    do: user_has_ability?(user, %{name: "all", resource: "host_checks_execution"})
end
