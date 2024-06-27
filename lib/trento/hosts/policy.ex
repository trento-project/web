defmodule Trento.Hosts.Policy do
  @moduledoc """
  Policy for the Hosts resource
  """
  @behaviour Bodyguard.Policy

  import Trento.Support.PolicyHelper
  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.Users.User

  def authorize(:select_checks, %User{} = user, HostReadModel),
    do: has_select_checks_ability?(user)

  def authorize(_, _, _), do: true

  defp has_select_checks_ability?(user),
    do:
      has_global_ability?(user) or
        user_has_ability?(user, %{name: "all", resource: "host_checks_selection"})
end
