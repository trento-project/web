defmodule Trento.Operations.ClusterPolicy do
  @moduledoc """
  ClusterReadModel operation policies
  """

  @behaviour Trento.Operations.PolicyBehaviour

  require Trento.Clusters.Enums.ClusterHostStatus, as: ClusterHostStatus
  require Trento.Clusters.Enums.ClusterType, as: ClusterType

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

  def authorize_operation(
        :cluster_maintenance_change,
        %ClusterReadModel{name: name, hosts: hosts},
        _
      ) do
    if Enum.any?(hosts, fn %{cluster_host_status: status} ->
         status == ClusterHostStatus.online()
       end) do
      :ok
    else
      {:error, ["Cluster #{name} does not have any online node"]}
    end
  end

  # can start a secondary node only if the primary node is already started
  def authorize_operation(
        :cluster_host_start,
        %ClusterReadModel{sap_instances: sap_instances, hosts: hosts, type: type},
        %{
          host_id: host_id
        }
      )
      when type in [ClusterType.hana_scale_up(), ClusterType.hana_scale_out()] do
    database_instances = get_cluster_database_instances(hosts, sap_instances)
    host_running_primary? = primary_instance_in_host?(database_instances, host_id)

    sr_primary_instances =
      get_sr_instances(
        database_instances,
        hosts,
        "Primary"
      )

    all_primary_running? =
      Enum.all?(sr_primary_instances, fn %{cluster_host_status: curr_status} ->
        curr_status == ClusterHostStatus.online()
      end)

    count_primary_running = Enum.count(sr_primary_instances)

    host = Enum.find(hosts, &(&1.id === host_id))

    cond do
      count_primary_running == 0 ->
        {:error,
         [
           "Cannot start node #{host.hostname} because no primary database instance is running in the cluster"
         ]}

      host_running_primary? or all_primary_running? ->
        :ok

      true ->
        host = Enum.find(hosts, &(&1.id === host_id))

        {:error,
         [
           "Cannot start secondary node #{host.hostname} before starting all the primary nodes"
         ]}
    end
  end

  def authorize_operation(:cluster_host_start, _, _), do: :ok

  # can stop a primary node only if all secondary nodes are already stopped
  def authorize_operation(
        :cluster_host_stop,
        %ClusterReadModel{sap_instances: sap_instances, hosts: hosts, type: type},
        %{
          host_id: host_id
        }
      )
      when type in [ClusterType.hana_scale_up(), ClusterType.hana_scale_out()] do
    database_instances = get_cluster_database_instances(hosts, sap_instances)
    host_running_primary? = primary_instance_in_host?(database_instances, host_id)

    sr_secondary_instances =
      get_sr_instances(
        database_instances,
        hosts,
        "Secondary"
      )

    all_secondary_stopped? =
      Enum.all?(sr_secondary_instances, fn %{cluster_host_status: curr_status} ->
        curr_status == ClusterHostStatus.offline()
      end)

    if host_running_primary? and not all_secondary_stopped? do
      host = Enum.find(hosts, &(&1.id === host_id))

      {:error,
       [
         "Cannot stop the primary node #{host.hostname} because some secondary nodes are still online"
       ]}
    else
      :ok
    end
  end

  def authorize_operation(:cluster_host_stop, _, _), do: :ok

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

  ### and the used functions, at the end, the unique thing that really changes:
  defp get_cluster_database_instances(hosts, sap_instances) do
    cluster_sids = Enum.map(sap_instances, fn %{sid: sid} -> sid end)

    hosts
    |> Enum.flat_map(fn %{database_instances: db_instances} -> db_instances end)
    |> Enum.filter(fn %{sid: sid} -> sid in cluster_sids end)
  end

  defp primary_instance_in_host?(database_instances, host_id) do
    Enum.any?(database_instances, fn %{host_id: inst_host_id, system_replication: sr} ->
      inst_host_id == host_id and sr == "Primary"
    end)
  end

  defp get_sr_instances(database_instances, hosts, sr_mode) do
    host_ids_with_srmode =
      Enum.flat_map(database_instances, fn
        %{host_id: host_id, system_replication: ^sr_mode} -> [host_id]
        _ -> []
      end)

    Enum.filter(hosts, fn %{id: host_id} -> host_id in host_ids_with_srmode end)
  end

  defp desired_unit_state(:pacemaker_enable), do: "disabled"
  defp desired_unit_state(:pacemaker_disable), do: "enabled"

  defp already_applied_unit_state(:pacemaker_enable), do: "enabled"
  defp already_applied_unit_state(:pacemaker_disable), do: "disabled"
end
