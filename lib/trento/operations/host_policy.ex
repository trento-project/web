defmodule Trento.Operations.HostPolicy do
  @moduledoc """
  HostReadModel operation policies
  """

  @behaviour Trento.Operations.PolicyBehaviour

  require Trento.Enums.Health, as: Health
  require Trento.Clusters.Enums.ClusterType, as: ClusterType
  require Trento.Clusters.Enums.ClusterHostStatus, as: ClusterHostStatus

  alias Trento.Support.OperationsHelper

  alias Trento.Databases.Projections.DatabaseInstanceReadModel
  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.SapSystems.Projections.ApplicationInstanceReadModel

  # saptune_solution_apply and saptune_solution_change operation authorized when:
  # - the sap workload is not running
  def authorize_operation(
        operation,
        %HostReadModel{
          application_instances: application_instances,
          database_instances: database_instances,
          saptune_status: saptune_status
        },
        _
      )
      when operation in [:saptune_solution_apply, :saptune_solution_change] do
    [
      authorize_saptune_solution_operation(
        operation,
        saptune_status
      ),
      ensure_all_instances_stopped(application_instances),
      ensure_all_instances_stopped(database_instances)
    ]
    |> List.flatten()
    |> OperationsHelper.reduce_operation_authorizations()
  end

  # based on the maintenance procedures for HANA clusters:
  # - pacemaker service is disabled (at boot) in the host to be rebooted
  # - pacemaker is stopped in the host
  # - If there is an SAP workload in the host, it is stopped (HANA instance, SAP instance)
  def authorize_operation(
        :reboot,
        %HostReadModel{
          cluster_id: nil,
          application_instances: application_instances,
          database_instances: database_instances
        },
        _
      ),
      do:
        authorize_reboot_operation(
          true,
          all_instances_stopped?(application_instances),
          all_instances_stopped?(database_instances),
          true
        )

  def authorize_operation(
        :reboot,
        %HostReadModel{cluster: %{type: cluster_type}},
        _
      )
      when cluster_type in [
             ClusterType.hana_ascs_ers(),
             ClusterType.unknown()
           ],
      do:
        {:error,
         [
           "The host belongs to unsupported cluster type #{cluster_type}"
         ]}

  def authorize_operation(
        :reboot,
        %HostReadModel{
          cluster_host_status: cluster_host_status,
          systemd_units: systemd_units,
          application_instances: application_instances,
          database_instances: database_instances
        },
        _
      ),
      do:
        authorize_reboot_operation(
          systemd_unit_enabled?(systemd_units, "pacemaker.service") == false,
          all_instances_stopped?(application_instances),
          all_instances_stopped?(database_instances),
          cluster_host_status == ClusterHostStatus.offline()
        )

  def authorize_operation(_, _, _), do: {:error, ["Unknown operation"]}

  defp authorize_saptune_solution_operation(
         :saptune_solution_apply,
         saptune_status
       ),
       do:
         saptune_status
         |> can_apply_solution?()
         |> or_error(
           "Cannot apply the requested solution because there is an already applied one on this host"
         )

  defp authorize_saptune_solution_operation(
         :saptune_solution_change,
         saptune_status
       ),
       do:
         saptune_status
         |> can_change_solution?()
         |> or_error(
           "Cannot change the requested solution because there is no currently applied one on this host"
         )

  defp can_apply_solution?(nil = _saptune_status), do: true
  defp can_apply_solution?(%{applied_solution: nil} = _saptune_status), do: true
  defp can_apply_solution?(_), do: false

  defp can_change_solution?(%{applied_solution: applied_solution})
       when not is_nil(applied_solution),
       do: true

  defp can_change_solution?(_), do: false

  defp authorize_reboot_operation(
         pacemaker_disabled,
         application_instances_stopped,
         database_instances_stopped,
         cluster_host_offline
       ) do
    authorizations = [
      or_error(pacemaker_disabled, "Pacemaker service is enabled in the host"),
      or_error(
        application_instances_stopped,
        "There are running application instances on the host"
      ),
      or_error(database_instances_stopped, "There are running database instances on the host"),
      or_error(cluster_host_offline, "Cluster is running in the host")
    ]

    OperationsHelper.reduce_operation_authorizations(authorizations)
  end

  defp or_error(true, _), do: :ok
  defp or_error(false, error), do: {:error, [error]}

  defp systemd_unit_enabled?(systemd_units, unit_name) do
    Enum.any?(systemd_units, fn
      %{name: ^unit_name, unit_file_state: "enabled"} -> true
      _ -> false
    end)
  end

  defp all_instances_stopped?([]), do: true

  defp all_instances_stopped?(instances) when is_list(instances),
    do: Enum.all?(instances, &instance_stopped?/1)

  defp instance_stopped?(%ApplicationInstanceReadModel{health: Health.unknown()}), do: true
  defp instance_stopped?(%DatabaseInstanceReadModel{health: Health.unknown()}), do: true
  defp instance_stopped?(_), do: false

  defp ensure_all_instances_stopped(instances),
    do: Enum.map(instances, &ensure_instance_stopped/1)

  defp ensure_instance_stopped(%ApplicationInstanceReadModel{
         sid: sid,
         instance_number: instance_number,
         health: health
       })
       when health != Health.unknown(),
       do: {:error, ["Instance #{instance_number} of SAP system #{sid} is not stopped"]}

  defp ensure_instance_stopped(%DatabaseInstanceReadModel{
         sid: sid,
         instance_number: instance_number,
         health: health
       })
       when health != Health.unknown(),
       do: {:error, ["Instance #{instance_number} of HANA database #{sid} is not stopped"]}

  defp ensure_instance_stopped(%instance_module{})
       when instance_module in [ApplicationInstanceReadModel, DatabaseInstanceReadModel],
       do: :ok

  defp ensure_instance_stopped(_), do: {:error, ["Unknown instance type"]}
end
