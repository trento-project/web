defmodule Trento.Operations.HostPolicy do
  @moduledoc """
  HostReadModel operation policies
  """

  @behaviour Trento.Operations.PolicyBehaviour

  require Trento.Clusters.Enums.ClusterType, as: ClusterType

  alias Trento.Support.OperationsHelper

  alias Trento.Clusters
  alias Trento.Databases.Projections.DatabaseInstanceReadModel
  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.SapSystems.Projections.ApplicationInstanceReadModel

  # saptune_solution_apply and saptune_solution_change operation authorized when:
  # - all SAP instances are authorized for maintenance
  def authorize_operation(
        operation,
        %HostReadModel{
          application_instances: application_instances,
          database_instances: database_instances,
          saptune_status: saptune_status
        } = host,
        _
      )
      when operation in [:saptune_solution_apply, :saptune_solution_change] do
    applications_maintenance_authorized =
      application_instances
      |> Enum.map(fn application_instance ->
        %ApplicationInstanceReadModel{application_instance | host: host}
      end)
      |> OperationsHelper.reduce_operation_authorizations(:ok, fn application_instance ->
        ApplicationInstanceReadModel.authorize_operation(:maintenance, application_instance, %{})
      end)

    databases_authorized =
      database_instances
      |> Enum.map(fn database_instances ->
        %DatabaseInstanceReadModel{database_instances | host: host}
      end)
      |> OperationsHelper.reduce_operation_authorizations(
        applications_maintenance_authorized,
        fn database_instances ->
          DatabaseInstanceReadModel.authorize_operation(:maintenance, database_instances, %{})
        end
      )

    operation
    |> authorize_saptune_solution_operation(saptune_status)
    |> List.wrap()
    |> OperationsHelper.reduce_operation_authorizations(databases_authorized)
  end

  # Based on the maintenance procedures for HANA clusters, it's clear to me the following:
  #   the pacemaker service is be disabled (at boot) in the node to be rebooted
  #   in a HANA scale-up cluster, pacemaker is stopped in all the cluster nodes
  #   in a HANA scale-out cluster, pacemaker is stopped in all secondary nodes
  #   in an ASCS/ERS cluster, pacemaker is stopped in all the cluster nodes
  def authorize_operation(:host_reboot, %HostReadModel{cluster_id: nil}, _), do: :ok

  def authorize_operation(
        :host_reboot,
        %HostReadModel{cluster: %{type: cluster_type} = cluster, systemd_units: systemd_units},
        _
      ) do
    cond do
      systemd_unit_enabled?(systemd_units, "pacemaker.service") ->
        {:error,
         [
           "Cannot reboot host #{cluster.name} because pacemaker service is enabled in the host"
         ]}

      cluster_type == ClusterType.hana_scale_up() ->
        if Clusters.all_nodes_stopped?(cluster) do
          :ok
        else
          {:error,
           [
             "Cannot reboot host #{cluster.name} because not all nodes are stopped in the cluster"
           ]}
        end

      cluster_type == ClusterType.hana_scale_out() ->
        if Clusters.secondary_nodes_stopped?(cluster) do
          :ok
        else
          {:error,
           [
             "Cannot reboot host #{cluster.name} because not all secondary nodes are stopped in the cluster"
           ]}
        end

      cluster_type == ClusterType.ascs_ers() ->
        if Clusters.all_nodes_stopped?(cluster) do
          :ok
        else
          {:error,
           [
             "Cannot reboot host #{cluster.name} because not all nodes are stopped in the cluster"
           ]}
        end

      true ->
        {:error,
         [
           "Cannot reboot host #{cluster.name} because it is part of a cluster with unknown type: #{cluster_type}"
         ]}
    end
  end

  def authorize_operation(_, _, _), do: {:error, ["Unknown operation"]}

  defp authorize_saptune_solution_operation(:saptune_solution_apply, nil), do: :ok

  defp authorize_saptune_solution_operation(:saptune_solution_apply, %{applied_solution: nil}),
    do: :ok

  defp authorize_saptune_solution_operation(:saptune_solution_apply, _),
    do:
      {:error,
       ["Cannot apply the requested solution because there is an already applied on this host"]}

  defp authorize_saptune_solution_operation(:saptune_solution_change, %{
         applied_solution: applied_solution
       })
       when not is_nil(applied_solution),
       do: :ok

  defp authorize_saptune_solution_operation(:saptune_solution_change, _),
    do:
      {:error,
       [
         "Cannot change the requested solution because there is no currently applied one on this host"
       ]}

  defp systemd_unit_enabled?(systemd_units, unit_name) do
    Enum.any?(systemd_units, fn
      %{name: ^unit_name, unit_file_state: "enabled"} -> true
      _ -> false
    end)
  end
end
