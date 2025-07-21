defmodule Trento.SapSystems.Policy do
  @moduledoc """
  Policy for the SAP systems resource

  User with the ability cleanup:application_instance can cleanup a SAP system instance.
  """
  @behaviour Bodyguard.Policy

  import Trento.Support.AbilitiesHelper
  alias Trento.SapSystems.Projections.SapSystemReadModel
  alias Trento.Users.User

  def authorize(:delete_application_instance, %User{} = user, SapSystemReadModel),
    do: has_global_ability?(user) or has_cleanup_ability?(user)

  def authorize(:request_instance_operation, %User{} = user, %{operation: "sap_instance_start"}),
    do: has_global_ability?(user) or has_app_instance_start_ability?(user)

  def authorize(:request_instance_operation, %User{} = user, %{operation: "sap_instance_stop"}),
    do: has_global_ability?(user) or has_app_instance_stop_ability?(user)

  def authorize(:request_operation, %User{} = user, %{operation: "sap_system_start"}),
    do: has_global_ability?(user) or has_sap_system_start_ability?(user)

  def authorize(:request_operation, %User{} = user, %{operation: "sap_system_stop"}),
    do: has_global_ability?(user) or has_sap_system_stop_ability?(user)

  def authorize(_, _, _), do: true

  defp has_cleanup_ability?(user),
    do: user_has_ability?(user, %{name: "cleanup", resource: "application_instance"})

  defp has_app_instance_start_ability?(user),
    do: user_has_ability?(user, %{name: "start", resource: "application_instance"})

  defp has_app_instance_stop_ability?(user),
    do: user_has_ability?(user, %{name: "stop", resource: "application_instance"})

  defp has_sap_system_start_ability?(user),
    do: user_has_ability?(user, %{name: "start", resource: "sap_system"})

  defp has_sap_system_stop_ability?(user),
    do: user_has_ability?(user, %{name: "stop", resource: "sap_system"})
end
