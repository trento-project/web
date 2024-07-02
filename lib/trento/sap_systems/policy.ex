defmodule Trento.SapSystems.Policy do
  @moduledoc """
  Policy for the SAP systems resource

  User with the ability cleanup:application_instance can cleanup a SAP system instance.
  """
  @behaviour Bodyguard.Policy

  import Trento.Support.PolicyHelper
  alias Trento.SapSystems.Projections.SapSystemReadModel
  alias Trento.Users.User

  def authorize(:delete_application_instance, %User{} = user, SapSystemReadModel),
    do: has_global_ability?(user) or has_cleanup_ability?(user)

  def authorize(_, _, _), do: true

  defp has_cleanup_ability?(user),
    do: user_has_ability?(user, %{name: "cleanup", resource: "application_instance"})
end
