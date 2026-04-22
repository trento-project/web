defmodule Trento.SapSystems.Policy do
  @moduledoc """
  Policy for the SAP systems resource

  User with the ability cleanup:application_instance can cleanup a SAP system instance.
  """
  @behaviour Bodyguard.Policy

  import Trento.Support.AbilitiesHelper

  alias Trento.SapSystems.Projections.{
    ApplicationInstanceReadModel,
    SapSystemReadModel
  }

  alias Trento.Users.User

  def authorize(:delete_application_instance, %User{} = user, SapSystemReadModel),
    do: has_global_ability?(user) or has_cleanup_ability?(user)

  def authorize(:sap_instance_start, %User{} = user, ApplicationInstanceReadModel),
    do: has_operation_ability?(user, "start", "application_instance")

  def authorize(:sap_instance_stop, %User{} = user, ApplicationInstanceReadModel),
    do: has_operation_ability?(user, "stop", "application_instance")

  def authorize(:sap_system_start, %User{} = user, SapSystemReadModel),
    do: has_operation_ability?(user, "start", "sap_system")

  def authorize(:sap_system_stop, %User{} = user, SapSystemReadModel),
    do: has_operation_ability?(user, "stop", "sap_system")

  def authorize(_, _, _), do: true

  defp has_cleanup_ability?(user),
    do: user_has_ability?(user, %{name: "cleanup", resource: "application_instance"})
end
