defmodule Trento.Operations.ApplicationInstancePolicy do
  @moduledoc """
  ApplicationInstanceReadModel operation policies
  """

  @behaviour Trento.Operations.PolicyBehaviour

  require Trento.Enums.Health, as: Health

  alias Trento.Support.OperationsHelper

  alias Trento.Clusters.Projections.ClusterReadModel
  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.SapSystems.Projections.ApplicationInstanceReadModel

  # maintenance operation authorized when:
  # - instance is not running
  # - cluster is in maintenance
  def authorize_operation(
        :maintenance,
        %ApplicationInstanceReadModel{} = application_instance,
        _params
      ) do
    OperationsHelper.reduce_operation_authorizations([
      instance_running(application_instance),
      cluster_maintenance(application_instance)
    ])
  end

  # instance start operation authorized when:
  # - other instances in the system are started
  # - database is started
  # - cluster is in maintenance
  def authorize_operation(
        :sap_instance_start,
        %ApplicationInstanceReadModel{} = application_instance,
        _params
      ) do
    OperationsHelper.reduce_operation_authorizations([
      other_instances_started(application_instance),
      database_started(application_instance),
      cluster_maintenance(application_instance)
    ])
  end

  # stop instance operation authorized when:
  # - other instances in the system are stopped
  # - cluster is in maintenance
  def authorize_operation(
        :sap_instance_stop,
        %ApplicationInstanceReadModel{} = application_instance,
        _params
      ) do
    OperationsHelper.reduce_operation_authorizations([
      other_instances_stopped(application_instance),
      cluster_maintenance(application_instance)
    ])
  end

  def authorize_operation(_, _, _), do: {:error, ["Unknown operation"]}

  defp instance_running(%ApplicationInstanceReadModel{
         sid: sid,
         instance_number: instance_number,
         health: health
       })
       when health != Health.unknown(),
       do: {:error, ["Instance #{instance_number} of SAP system #{sid} is not stopped"]}

  defp instance_running(_), do: :ok

  # Message Server, start without depending on other instances
  defp other_instances_started(%ApplicationInstanceReadModel{
         features: "MESSAGESERVER" <> _
       }) do
    :ok
  end

  # Enq rep and App servers, start only if Message server is started
  defp other_instances_started(%ApplicationInstanceReadModel{
         host_id: host_id,
         sid: sid,
         instance_number: instance_number,
         sap_system: %{
           application_instances: instances
         }
       }) do
    message_server_instance =
      instances
      |> reject_current_instance(host_id, instance_number)
      |> Enum.find(fn %{features: features} ->
        features =~ "MESSAGESERVER"
      end)

    case message_server_instance do
      %{health: :passing} ->
        :ok

      %{instance_number: msg_instance_number} ->
        {:error, ["Message server #{msg_instance_number} of SAP system #{sid} is not started"]}

      nil ->
        {:error, ["Message server not found in SAP system #{sid}"]}
    end
  end

  # Message Server and Enq rep, start without depending on database
  defp database_started(%ApplicationInstanceReadModel{features: "MESSAGESERVER" <> _}), do: :ok
  defp database_started(%ApplicationInstanceReadModel{features: "ENQREP"}), do: :ok

  # ABAP and JAVA servers, start only if database is started
  defp database_started(%ApplicationInstanceReadModel{
         sap_system: %{
           database: %{
             health: :passing
           }
         }
       }),
       do: :ok

  defp database_started(%ApplicationInstanceReadModel{
         sap_system: %{
           database: %{
             sid: sid
           }
         }
       }),
       do: {:error, ["Database #{sid} is not started"]}

  # Message server, stop only if the other instances are stopped
  defp other_instances_stopped(%ApplicationInstanceReadModel{
         features: "MESSAGESERVER" <> _,
         host_id: host_id,
         sid: sid,
         instance_number: instance_number,
         sap_system: %{
           application_instances: instances
         }
       }) do
    instances
    |> reject_current_instance(host_id, instance_number)
    |> Enum.filter(fn %{health: health} ->
      health != :unknown
    end)
    |> case do
      [] ->
        :ok

      running_instances ->
        {:error,
         Enum.map(running_instances, fn %{instance_number: inst_number} ->
           "Instance #{inst_number} of SAP system #{sid} is not stopped"
         end)}
    end
  end

  # Other instances, stop without depending on other instances
  defp other_instances_stopped(_), do: :ok

  defp cluster_maintenance(%ApplicationInstanceReadModel{host: %HostReadModel{cluster: nil}}),
    do: :ok

  defp cluster_maintenance(%ApplicationInstanceReadModel{
         sid: sid,
         instance_number: instance_number,
         host: %{cluster: %{sap_instances: sap_instances} = cluster}
       }) do
    is_clustered =
      Enum.any?(sap_instances, fn
        %{sid: ^sid, instance_number: ^instance_number} -> true
        _ -> false
      end)

    if is_clustered do
      resource_id = get_cluster_resource_id(sid, cluster)

      ClusterReadModel.authorize_operation(:maintenance, cluster, %{
        cluster_resource_id: resource_id
      })
    else
      :ok
    end
  end

  defp get_cluster_resource_id(sid, %{details: %{resources: resources}}) do
    Enum.find_value(resources, fn
      %{id: id, type: "ocf::heartbeat:SAPInstance", sid: ^sid} -> id
      _ -> nil
    end)
  end

  defp get_cluster_resource_id(_, _), do: nil

  defp reject_current_instance(instances, host_id, instance_number) do
    Enum.reject(instances, fn %{instance_number: inst_number, host_id: h_id} ->
      instance_number == inst_number && host_id == h_id
    end)
  end
end
