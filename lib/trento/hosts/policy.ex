defmodule Trento.Hosts.Policy do
  @moduledoc """
  Policy for the Host resource

  User with the ability all:all can perform any operation on the hosts.
  User with the ability all:host_checks_execution can perform a check executions on Hosts.
  User with the ability all:host_checks_selection can perform a check selection on Hosts.
  User with the ability cleanup:host can cleanup a host.
  """
  @behaviour Bodyguard.Policy

  import Trento.Support.AbilitiesHelper
  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.Users.User

  def authorize(:select_checks, %User{} = user, HostReadModel),
    do:
      has_global_ability?(user) or
        user_has_ability?(user, %{name: "all", resource: "host_checks_selection"})

  def authorize(:request_checks_execution, %User{} = user, HostReadModel),
    do:
      has_global_ability?(user) or
        user_has_ability?(user, %{name: "all", resource: "host_checks_execution"})

  def authorize(:delete, %User{} = user, HostReadModel),
    do: has_global_ability?(user) or user_has_ability?(user, %{name: "cleanup", resource: "host"})

  def authorize(:request_operation, %User{} = user, %{operation: operation})
      when operation in ["saptune_solution_change", "saptune_solution_apply", "reboot"],
      do:
        has_global_ability?(user) or user_has_ability?(user, %{name: operation, resource: "host"})

  def authorize(_, _, _), do: true
end
