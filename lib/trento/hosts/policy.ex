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

  require Trento.Operations.Enums.HostOperations, as: HostOperations

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

  def authorize(operation, %User{} = user, HostReadModel)
      when operation in HostOperations.values(),
      do:
        has_global_ability?(user) or
          user_has_ability?(user, %{name: Atom.to_string(operation), resource: "host"})

  def authorize(_, _, _), do: true
end
