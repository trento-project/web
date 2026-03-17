defmodule Trento.Operations.SapSystemPolicy do
  @moduledoc """
  SapSystemReadModel operation policies
  """

  @behaviour Trento.Operations.PolicyBehaviour

  require Trento.Operations.Enums.SapSystemOperations, as: SapSystemOperations

  alias Trento.Support.OperationsHelper

  alias Trento.SapSystems.Projections.{
    ApplicationInstanceReadModel,
    SapSystemReadModel
  }

  alias Trento.Hosts.Projections.HostReadModel

  # for all operations, check the heartbeat of all the hosts composing the SAP system
  # authorize if at least one host heartbeat is passing
  def authorize_operation(
        operation,
        %SapSystemReadModel{application_instances: instances} = sap_systen,
        params
      )
      when operation in SapSystemOperations.values() do
    some_heartbeat_passing? =
      Enum.any?(instances, fn %ApplicationInstanceReadModel{
                                host: %HostReadModel{heartbeat: heartbeat}
                              } ->
        heartbeat == :passing
      end)

    if some_heartbeat_passing? do
      do_authorize_operation(operation, sap_systen, params)
    else
      {:error, ["Trento agent is not currently running in any of the hosts in the SAP system"]}
    end
  end

  def authorize_operation(_, _, _), do: {:error, ["Unknown operation"]}

  defp do_authorize_operation(
         :sap_system_start,
         %SapSystemReadModel{} = sap_system,
         params
       ) do
    OperationsHelper.reduce_operation_authorizations([
      aplication_instances_cluster_maintenance(sap_system, params),
      database_started(sap_system),
      other_instances_started(sap_system, params)
    ])
  end

  defp do_authorize_operation(
         :sap_system_stop,
         %SapSystemReadModel{} = sap_system,
         params
       ) do
    OperationsHelper.reduce_operation_authorizations([
      aplication_instances_cluster_maintenance(sap_system, params),
      other_instances_stopped(sap_system, params)
    ])
  end

  defp aplication_instances_cluster_maintenance(_, %{instance_type: type})
       when type in ["abap", "j2ee"],
       do: :ok

  defp aplication_instances_cluster_maintenance(
         %SapSystemReadModel{
           application_instances: application_instances
         },
         _
       ) do
    OperationsHelper.reduce_operation_authorizations(
      application_instances,
      :ok,
      fn application_instance ->
        ApplicationInstanceReadModel.authorize_operation(
          :cluster_maintenance,
          application_instance,
          %{}
        )
      end
    )
  end

  defp database_started(%SapSystemReadModel{
         database_instances: database_instances
       }) do
    database_instances
    |> Enum.filter(fn
      %{health: health, system_replication: sr} when sr in [nil, "Primary"] ->
        health != :passing

      _ ->
        false
    end)
    |> case do
      [] ->
        :ok

      [%{sid: sid, system_replication: "Primary", system_replication_site: site} | _] ->
        {:error, ["Database #{sid} primary site #{site} is not started"]}

      [%{sid: sid} | _] ->
        {:error, ["Database #{sid} is not started"]}
    end
  end

  defp other_instances_started(_, %{instance_type: "scs"}), do: :ok
  defp other_instances_started(_, %{instance_type: "all"}), do: :ok
  defp other_instances_started(_, params) when not is_map_key(params, :instance_type), do: :ok

  defp other_instances_started(
         %SapSystemReadModel{
           application_instances: application_instances
         },
         _
       ) do
    application_instances
    |> Enum.filter(fn %{features: features, health: health} ->
      health != :passing && features =~ "MESSAGESERVER"
    end)
    |> case do
      [] ->
        :ok

      running_instances ->
        {:error,
         Enum.map(running_instances, fn %{sid: sid, instance_number: inst_number} ->
           "Instance #{inst_number} of SAP system #{sid} is not started"
         end)}
    end
  end

  defp other_instances_stopped(
         %SapSystemReadModel{
           application_instances: application_instances
         },
         %{instance_type: "scs"}
       ) do
    application_instances
    |> Enum.filter(fn %{features: features, health: health} ->
      health != :unknown && !String.contains?(features, "MESSAGESERVER")
    end)
    |> case do
      [] ->
        :ok

      running_instances ->
        {:error,
         Enum.map(running_instances, fn %{sid: sid, instance_number: inst_number} ->
           "Instance #{inst_number} of SAP system #{sid} is not stopped"
         end)}
    end
  end

  defp other_instances_stopped(_, _), do: :ok
end
