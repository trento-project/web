defmodule Trento.Operations.ClusterPolicy do
  @moduledoc """
  ClusterReadModel operation policies
  """

  @behaviour Trento.Operations.PolicyBehaviour

  alias Trento.Clusters

  alias Trento.Clusters.Projections.ClusterReadModel

  alias Trento.Hosts.Projections.HostReadModel

  # maintenance operation authorized when:
  # - cluster is in maintenance
  # - cluster resource is not managed
  def authorize_operation(
        :maintenance,
        %ClusterReadModel{name: name} = cluster,
        %{cluster_resource_id: nil}
      ) do
    if Clusters.maintenance?(cluster) do
      :ok
    else
      {:error, ["Cluster #{name} operating this host is not in maintenance mode"]}
    end
  end

  def authorize_operation(
        :maintenance,
        %ClusterReadModel{name: name} = cluster,
        %{cluster_resource_id: cluster_resource_id}
      ) do
    if Enum.any?([
         Clusters.maintenance?(cluster),
         not Clusters.resource_managed?(cluster, cluster_resource_id)
       ]) do
      :ok
    else
      {:error,
       [
         "Cluster #{name} or resource #{cluster_resource_id} operating this host are not in maintenance mode"
       ]}
    end
  end

  def authorize_operation(:cluster_maintenance_change, _, _), do: :ok

  def authorize_operation(
        operation,
        %ClusterReadModel{hosts: hosts},
        %{host_id: host_id}
      )
      when operation in [:pacemaker_enable, :pacemaker_disable] do
    %HostReadModel{
      hostname: hostname,
      systemd_units: systemd_units
    } = Enum.find(hosts, &(&1.id === host_id))

    unit_file_state =
      Enum.find_value(systemd_units, fn
        %{name: "pacemaker.service", unit_file_state: unit_file_state} -> unit_file_state
        _ -> nil
      end)

    desired_unit_state = desired_unit_state(operation)
    already_applied_state = already_applied_unit_state(operation)

    case unit_file_state do
      ^desired_unit_state ->
        :ok

      ^already_applied_state ->
        {:error,
         [
           "Pacemaker service on host #{hostname} is already #{already_applied_state}"
         ]}

      _ ->
        {:error,
         [
           "Pacemaker service unit state is unrecognized on host #{hostname}"
         ]}
    end
  end

  def authorize_operation(_, _, _), do: {:error, ["Unknown operation"]}

  defp desired_unit_state(:pacemaker_enable), do: "disabled"
  defp desired_unit_state(:pacemaker_disable), do: "enabled"

  defp already_applied_unit_state(:pacemaker_enable), do: "enabled"
  defp already_applied_unit_state(:pacemaker_disable), do: "disabled"
end
